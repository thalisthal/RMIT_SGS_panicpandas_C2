# CarePass — Cross-Hospital Medical Record Sharing

A cross-hospital record sharing prototype where a Hospital A doctor creates an encrypted patient record, the patient controls access, and Hospital A's admin cannot decrypt the record.

## 1. Vision & Originality
A trustless cross-hospital collaboration tool. The patient holds the gatekeeping authority. No admin has standing authority over plaintext data.

## 2. Trust Constraint Insight
Today, sharing records requires trusting the admin who holds the database keys. Our app removes that trust requirement by making decryption mathematically impossible for the admin.

## 3. Value & Impact
Patients transferred between hospitals get immediate care without waiting for records. Admins cannot snoop on records they have no clinical need to see.

## 4. Why TideCloak Matters
Doctor A holds `_tide_medical_record.selfencrypt`. Doctor B holds `_tide_medical_record.selfdecrypt` only when authorized. The admin holds neither. When the admin calls `doDecrypt()`, the Fabric nodes refuse to compute. This is Emergent Authority.

## 5. Prototype & Storytelling
**The key interaction:**
1. Doctor A creates and encrypts a record.
2. Admin A attempts to decrypt and **fails**.
3. Patient authorizes Doctor B.
4. Doctor B successfully decrypts and reads.
5. Admin A tries again and **still fails**.

**Video:** See `demo.mp4` in the repository root.
