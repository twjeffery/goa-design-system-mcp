# GoA Design System Recipes

This directory contains recipe JSON files that describe reusable service patterns for Government of Alberta applications.

## Structure

- All recipe files are stored in this flat directory
- Files are named using the pattern: `{recipe-id}.json`
- Recipe IDs match the corresponding example filename (without .tsx extension)
- Organization is handled through JSON metadata, not directory structure

## Recipe Types

Recipes are categorized by:
- **userType**: `citizen`, `worker`, or `both` 
- **category**: `citizen-facing`, `worker-facing`, `layout-pattern`, `form-pattern`, `interaction-pattern`

## Examples

- `ask-user-for-birthday.json` - Citizen-facing form pattern
- `worker-dashboard-overview.json` - Worker-facing dashboard pattern  
- `basic-page-layout.json` - Layout pattern applicable to both users

## Schema

All recipes follow the schema defined in `../recipe-schema.json`

## Sync

These files are kept in sync with the corresponding TSX files in `ui-components-docs/src/examples/`