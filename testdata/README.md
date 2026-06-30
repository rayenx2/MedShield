# Test Data

Sample documents for manually exercising the upload/download/AI-summary/drug-interaction
flows. All content is synthetic and fictional — no real patient data.

| File | Document type | Notes |
|---|---|---|
| `CBC_Lab_Report.pdf` | `lab_report` | Synthetic CBC with flagged abnormal values (mild anemia pattern), modeled on public CBC report formats |
| `Prescription_Metformin.pdf` | `prescription` | Synthetic prescription — Metformin + Atorvastatin |
| `Discharge_Summary.pdf` | `discharge_summary` | Synthetic hospital discharge summary — iron-deficiency anemia workup |
| `Diagnosis_Note.pdf` | `diagnosis` | Synthetic outpatient diagnosis/treatment note, references a Warfarin–Aspirin interaction for testing the Drug Interactions feature |
| `chest_xray.jpg` | `imaging` | [Normal PA chest radiograph](https://commons.wikimedia.org/wiki/File:Normal_posteroanterior_(PA)_chest_radiograph_(X-ray).jpg) — public domain (CC0), Wikimedia Commons |
| `brain_mri.jpg` | `imaging` | [MRI brain.jpg](https://commons.wikimedia.org/wiki/File:MRI_brain.jpg) — public domain, Wikimedia Commons |

The PDFs were generated with `reportlab`; see the patient/doctor names and values are
all fictional test fixtures (`Test Patient`, `Dr. Test`, `patient1@test.com`).

Upload via the doctor or hospital role's upload form, or seed directly:

```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -F "file=@testdata/CBC_Lab_Report.pdf" \
  -F "documentType=lab_report" \
  -F "patientId=patient1@test.com"
```
