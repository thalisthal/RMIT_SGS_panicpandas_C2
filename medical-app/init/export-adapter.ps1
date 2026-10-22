param(
  [string]$BaseUrl = 'http://localhost:8080',
  [string]$Realm = 'nextjs-test',
  [string]$ClientId = 'myclient',
  [string]$ContainerName = 'mytidecloak',
  [string]$OutputPath = '..\tidecloak.json'
)

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')

if ($BaseUrl -notmatch '^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$' -and $BaseUrl -notmatch '^https://') {
  throw 'Refusing to send TideCloak admin credentials to a non-loopback HTTP server. Use HTTPS for remote TideCloak.'
}

function Get-AdminAccessToken {
  param(
    [string]$Username,
    [string]$Password
  )

  $response = Invoke-RestMethod `
    -Method Post `
    -Uri "$BaseUrl/realms/master/protocol/openid-connect/token" `
    -ContentType 'application/x-www-form-urlencoded' `
    -Body @{
      username   = $Username
      password   = $Password
      grant_type = 'password'
      client_id  = 'admin-cli'
    }

  if (-not $response.access_token) {
    throw 'TideCloak did not return an admin access token.'
  }

  return $response.access_token
}

$username = 'admin'
$password = $null
$accessToken = $null

if (Get-Command docker -ErrorAction SilentlyContinue) {
  try {
    $container = (docker inspect $ContainerName 2>$null | ConvertFrom-Json)[0]
    foreach ($variable in $container.Config.Env) {
      if ($variable -match '^KC_BOOTSTRAP_ADMIN_USERNAME=(.*)$') {
        $username = $Matches[1]
      }
      elseif ($variable -match '^KC_BOOTSTRAP_ADMIN_PASSWORD=(.*)$') {
        $password = $Matches[1]
      }
    }
  }
  catch {
    $password = $null
  }
}

if ($password) {
  try {
    $accessToken = Get-AdminAccessToken -Username $username -Password $password
    Write-Host "Using the bootstrap admin credential from local container '$ContainerName'."
  }
  catch {
    $password = $null
    Write-Warning 'The container bootstrap credential was rejected; it may have been changed after setup.'
  }
}

if (-not $accessToken) {
  $adminCredential = Get-Credential -UserName $username -Message "Enter the current admin account for the existing TideCloak realm at $BaseUrl"
  $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminCredential.Password)
  try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $username = $adminCredential.UserName
    try {
      $accessToken = Get-AdminAccessToken -Username $username -Password $password
    }
    catch {
      throw 'TideCloak rejected these credentials. Check the current admin username/password; do not rerun realm provisioning to export this config.'
    }
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  }
}

try {
  $headers = @{ Authorization = "Bearer $accessToken" }
  $encodedClientId = [Uri]::EscapeDataString($ClientId)
  $clients = Invoke-RestMethod `
    -Method Get `
    -Uri "$BaseUrl/admin/realms/$Realm/clients?clientId=$encodedClientId" `
    -Headers $headers

  $client = @($clients | Where-Object { $_.clientId -eq $ClientId })
  if ($client.Count -ne 1) {
    throw "Expected one client named '$ClientId' in realm '$Realm'; found $($client.Count). No config was written."
  }

  $clientUuid = [Uri]::EscapeDataString([string]$client[0].id)
  try {
    $adapter = Invoke-RestMethod `
      -Method Get `
      -Uri "$BaseUrl/admin/realms/$Realm/vendorResources/get-installations-provider?clientId=$clientUuid&providerId=keycloak-oidc-keycloak-json" `
      -Headers $headers
  }
  catch {
    $serverMessage = $_.ErrorDetails.Message
    if (-not $serverMessage) {
      $serverMessage = $_.Exception.Message
    }
    throw "TideCloak could not export the adapter for '$ClientId'. Realm key setup may not have completed. Server response: $serverMessage"
  }

  foreach ($field in @('realm', 'auth-server-url', 'resource', 'jwk', 'vendorId', 'homeOrkUrl')) {
    if (-not $adapter.$field) {
      throw "The exported adapter is missing required field '$field'. No config was written."
    }
  }

  if ([IO.Path]::IsPathRooted($OutputPath)) {
    $resolvedOutputPath = [IO.Path]::GetFullPath($OutputPath)
  }
  else {
    $resolvedOutputPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot $OutputPath))
  }
  $temporaryPath = "$resolvedOutputPath.$([Guid]::NewGuid().ToString('N')).tmp"
  $json = ConvertTo-Json -InputObject $adapter -Depth 100
  try {
    [IO.File]::WriteAllText($temporaryPath, $json, [Text.UTF8Encoding]::new($false))
    Move-Item -LiteralPath $temporaryPath -Destination $resolvedOutputPath -Force
  }
  finally {
    if (Test-Path -LiteralPath $temporaryPath) {
      Remove-Item -LiteralPath $temporaryPath -Force
    }
  }

  Write-Host "Adapter config exported to $resolvedOutputPath"
  Write-Host 'Restart the Next.js dev server, then reload the app.'
}
finally {
  $password = $null
  $accessToken = $null
}
