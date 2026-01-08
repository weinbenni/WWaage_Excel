# Usage Examples - Excel to Cards Importer

This document provides practical examples of how to use the Excel to Cards Importer Power-Up with different field mapping scenarios.

## 📋 Sample Data

The included `sample_tasks.xlsx` contains the following columns:
- **Task Name**: Title of the task
- **Description**: Detailed description
- **Location**: Physical location or office
- **Due Date**: Deadline (YYYY-MM-DD format)
- **Priority**: Priority level (High, Medium, Low, Critical)
- **Assigned To**: Person responsible
- **Department**: Department name
- **Estimated Hours**: Time estimate
- **Status**: Current status

## 🎯 Basic Field Mappings

### Example 1: Simple One-to-One Mapping

**Card Name**: Task Name  
**Description**: Description  
**Location**: Location  
**Due Date**: Due Date  

This creates cards with basic information from single columns.

### Example 2: Combined Fields

**Card Name**: `%Task Name + " (" + %Priority + ")"`  
Result: "Complete Project Proposal (High)"

**Description**: `"Assigned to: " + %Assigned To + "\\nDepartment: " + %Department + "\\n\\n" + %Description`  
Result: 
```
Assigned to: John Smith
Department: Operations

Finalize and submit the Q4 project proposal
```

### Example 3: Rich Card Creation

**Card Name**: `%Task Name`  
**Description**: 
```
%Description + "\\n\\n" + 
"📍 Location: " + %Location + "\\n" +
"👤 Assigned: " + %Assigned To + "\\n" +
"⏱️ Estimated: " + %Estimated Hours + " hours" + "\\n" +
"📊 Status: " + %Status
```

**Labels**: `%Priority + ", " + %Department`  
**Due Date**: `%Due Date`

This creates comprehensive cards with all relevant information formatted nicely.

## 🔧 Advanced Syntax Examples

### Conditional Formatting

**Card Name**: 
```
%Priority === "Critical" ? "🚨 " + %Task Name : 
%Priority === "High" ? "🔴 " + %Task Name : 
%Priority === "Medium" ? "🟡 " + %Task Name : 
"🟢 " + %Task Name
```

### Location-Based Formatting

**Description**: 
```
%Description + "\\n\\n" +
(%Location.includes("Office") ? "🏢 On-site: " : "🏠 Remote: ") + %Location
```

### Status-Based Organization

**Labels**: `%Status + ", " + %Priority + ", " + %Department`  
This creates labels for filtering by status, priority, and department.

## 📊 Business Use Cases

### Project Management
**Excel Structure**:
- Project Name, Task, Owner, Due Date, Priority, Status

**Card Name**: `%Project Name + " - " + %Task`  
**Description**: `"Owner: " + %Owner + "\\nPriority: " + %Priority + "\\nStatus: " + %Status`  
**Labels**: `%Priority`

### Event Planning
**Excel Structure**:
- Event Name, Task, Venue, Date, Responsible Person, Budget

**Card Name**: `%Event Name + " - " + %Task`  
**Description**: `"Venue: " + %Venue + "\\nDate: " + %Date + "\\nBudget: $" + %Budget + "\\n\\nResponsible: " + %Responsible Person`  
**Location**: `%Venue`  
**Due Date**: `%Date`

### Sales Pipeline
**Excel Structure**:
- Company, Contact, Deal Value, Stage, Next Action, Follow-up Date

**Card Name**: `%Company + " - $" + %Deal Value`  
**Description**: `"Contact: " + %Contact + "\\nStage: " + %Stage + "\\nNext Action: " + %Next Action`  
**Due Date**: `%Follow-up Date`  
**Labels**: `%Stage`

## 🎨 Formatting Tips

### Emoji Usage
Add emojis to make cards more visually appealing:
- High Priority: 🚨 🔴
- Medium Priority: ⚠️ 🟡
- Low Priority: ✅ 🟢
- Meetings: 📅 🤝
- Tasks: ✅ 📋
- Reviews: 👀 🔍

### Line Breaks
Use `\n` for line breaks in descriptions:
```
%Task Name + "\n\n" + 
"Details: " + %Description + "\n" +
"Due: " + %Due Date
```

### Text Formatting
Combine multiple elements:
```
"Project: " + %Project + "\n" +
"Assigned: " + %Assigned To + "\n" +
"Deadline: " + %Due Date + "\n\n" +
"Description: " + %Description
```

## 🚀 Best Practices

1. **Consistent Column Names**: Use clear, consistent column headers in Excel
2. **Test with Preview**: Always use the preview feature before importing
3. **Start Small**: Test with 2-3 rows first, then import the full dataset
4. **Backup Data**: Keep your original Excel file as backup
5. **Use Labels Wisely**: Don't create too many labels - group similar items

## 🐛 Troubleshooting Examples

### Issue: Syntax Error
**Problem**: `%Column Name + "test"`  
**Solution**: `%Column Name + " test"` (add space inside quotes)

### Issue: Wrong Column Reference
**Problem**: `%TaskName` (when column is "Task Name")  
**Solution**: `%Task Name` (use exact column name with space)

### Issue: Missing Data
**Problem**: Some cards have empty fields  
**Solution**: Check that Excel columns don't have trailing spaces in headers

### Issue: Date Format
**Problem**: Due dates not showing correctly  
**Solution**: Use YYYY-MM-DD format in Excel for best compatibility

## 📈 Performance Tips

- **Batch Processing**: Import up to 100 cards at once for best performance
- **Clean Data**: Remove empty rows and columns before importing
- **Optimize Images**: If including images, ensure they're optimized for web
- **Network**: Ensure stable internet connection during import

## 🔗 Integration Ideas

### With Other Power-Ups
- **Card Repeater**: Set up recurring tasks from Excel
- **Custom Fields**: Map additional data to custom fields
- **Calendar**: View imported cards with due dates on calendar
- **Voting**: Let team members vote on imported feature requests

### With External Tools
- **Google Sheets**: Export from Sheets to Excel, then import
- **Microsoft Excel**: Use Excel formulas to prepare data
- **Zapier**: Automate Excel exports from other tools
- **APIs**: Generate Excel files from other systems

---

**Need more examples?** Create an issue on GitHub with your specific use case!