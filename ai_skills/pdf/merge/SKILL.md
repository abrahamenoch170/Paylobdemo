---
name: merge_pdf
description: Merge multiple PDF documents into one.
parameters:
  type: object
  properties:
    fileIds:
      type: array
      items:
        type: string
      description: The IDs of the files to merge.
  required:
    - fileIds
---
# Merge PDF
This skill merges multiple PDFs.
