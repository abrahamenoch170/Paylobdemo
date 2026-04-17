---
name: compress_pdf
description: Compresses a PDF document to reduce file size.
parameters:
  type: object
  properties:
    fileUrl:
      type: string
      description: The URL of the PDF to compress.
  required:
    - fileUrl
---
