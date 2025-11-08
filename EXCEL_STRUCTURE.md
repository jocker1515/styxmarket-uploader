# Excel File Structure Example

Your Excel file should have the following columns:

| № п/п | file name | textarea | Price | link |
|-------|-----------|----------|-------|------|
| 1 | Product Name 1 | Description of product 1 | 100.50 | https://example.com/product1 |
| 2 | Product Name 2 | Description of product 2 | 250.00 | https://example.com/product2 |
| 3 | Product Name 3 | Description of product 3 | 75.25 | https://example.com/product3 |

## Column Details

- **№ п/п**: Serial number (optional, not used by script)
- **file name**: Product name → "Название предмета" field
- **textarea**: Product description → "Описание" field  
- **Price**: Product price → "Цена" field
- **link**: Product link → Used to create TXT file for upload

## Important Notes

- Column names must match exactly (case sensitive)
- Empty cells are handled gracefully
- Price should be numeric (script will clean non-numeric characters)
- Link is required for TXT file creation