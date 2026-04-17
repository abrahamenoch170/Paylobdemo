---
name: compress_pdf
description: Compress a PDF document to reduce file size.
parameters:
  type: object
  properties:
    fileId:
      type: string
      description: The ID of the file to compress.
  required:
    - fileId
---
# Compress PDF
This skill makes an API call to compress a loaded PDF document.
