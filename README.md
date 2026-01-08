# Excel to Cards Importer - Trello Power-Up

A powerful Trello Power-Up that allows you to import Excel data and convert it into Trello cards with flexible field mapping and custom syntax parsing.

## ✨ Features

- **📊 Excel Import**: Support for .xlsx, .xls, and .csv files
- **🎯 Flexible Field Mapping**: Map Excel columns to any Trello card field
- **🔧 Custom Syntax**: Combine multiple columns using intuitive syntax like `%Column1 + "; " + %Column2`
- **👁️ Live Preview**: Preview your cards before importing
- **🏷️ Label Management**: Automatically create and assign labels
- **📅 Due Date Support**: Parse and set due dates from Excel data
- **👥 Member Assignment**: Assign members to cards
- **🎨 Modern UI**: Clean, responsive interface with drag-and-drop support

## 🚀 Quick Start

### 1. Installation

1. Clone or download this repository
2. Host the files on a web server (or use a service like GitHub Pages)
3. Create a new Trello Power-Up in the [Trello Power-Up Admin Portal](https://trello.com/power-ups/admin)
4. Configure your Power-Up with the provided `manifest.json`
5. Update the `appKey` in `js/powerup.js` and `js/main.js` with your Trello API key

### 2. Configuration

1. **Get Trello API Key**:
   - Visit [Trello Power-Up Admin Portal](https://trello.com/power-ups/admin)
   - Create a new Power-Up
   - Generate an API key
   - Replace `YOUR_TRELLO_APP_KEY` in the JavaScript files

2. **Update Manifest**:
   - Update the author, homepage, and repository URLs in `manifest.json`
   - Configure the connector URL to point to your hosted `main.html`

### 3. Deploy

Host the files on any web server that supports static files:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any traditional web hosting service

## 📖 Usage Guide

### Step 1: Upload Excel File
- Click "Choose File" or drag and drop your Excel file
- Supported formats: .xlsx, .xls, .csv
- The first row should contain column headers

### Step 2: Map Fields
- Select which Excel columns map to which Trello card fields
- **Required**: At least map the "Card Name" field
- **Optional**: Map description, location, due date, labels, and members

### Step 3: Use Custom Syntax (Optional)
- Click the 📝 button next to any field to open the syntax editor
- Use `%ColumnName` to reference Excel columns
- Combine columns with operators: `+`, `"text"`, `\n` for new lines

**Syntax Examples:**
```
%ColumnName1
%ColumnName1 + "; " + %ColumnName2
%ColumnName1 + "\n" + %ColumnName2
"Location: " + %Location + "\nDate: " + %Date
```

### Step 4: Preview
- Click "Preview" to see how your cards will look
- Review the first 5 rows to verify your mappings

### Step 5: Import
- Click "Import Cards" to create Trello cards
- Cards will be added to the first list on your board
- View import results and any errors

## 🔧 Advanced Features

### Custom Syntax Parser

The Power-Up includes a powerful syntax parser that allows you to:

- **Reference columns**: `%ColumnName`
- **Combine text**: Use `+` operator
- **Add literals**: `"Your text here"`
- **New lines**: `\n`
- **Complex expressions**: Combine multiple operations

**Examples:**
```javascript
// Single column
%Title

// Combine two columns with separator
%FirstName + " " + %LastName

// Multi-line description
%Title + "\n\nLocation: " + %Location + "\nDate: " + %Date

// Conditional-like behavior
%Status + " - " + %Priority
```

### Label Management

- Automatically creates labels that don't exist on the board
- Assigns random colors to new labels
- Supports comma-separated label names

### Due Date Parsing

- Accepts various date formats from Excel
- Converts to ISO format for Trello
- Supports standard Excel date formats

## 🛠️ Development

### Project Structure

```
trello-excel-powerup/
├── manifest.json          # Power-Up configuration
├── css/
│   └── styles.css         # UI styles
├── js/
│   ├── powerup.js         # Trello Power-Up initialization
│   └── main.js            # Main application logic
├── html/
│   └── main.html          # Main UI interface
├── assets/
│   ├── icon-dark.svg      # Dark mode icon
│   └── icon-light.svg     # Light mode icon
└── README.md              # This file
```

### Key Technologies

- **SheetJS**: Excel file parsing
- **Trello Power-Up Client**: Trello integration
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern styling with animations
- **SVG Icons**: Scalable vector graphics

### API Integration

The Power-Up uses Trello's REST API to:
- Create cards
- Add labels
- Set due dates
- Assign members

Authentication is handled automatically through Trello's OAuth flow.

## 🐛 Troubleshooting

### Common Issues

**1. File Upload Fails**
- Ensure file format is .xlsx, .xls, or .csv
- Check that the file has a header row
- Verify the file isn't corrupted

**2. Cards Not Created**
- Verify Trello API key is correctly set
- Check that the user has write permissions on the board
- Ensure at least the "Card Name" field is mapped

**3. Syntax Errors**
- Use exact column names (case-sensitive)
- Wrap text literals in quotes: `"text"`
- Use `%ColumnName` format for column references

**4. Power-Up Not Loading**
- Check browser console for errors
- Verify all files are properly hosted
- Ensure HTTPS is used for hosting

### Debug Mode

Enable debug logging by opening the browser console:
```javascript
// The application logs key events to console
console.log('Excel data:', app.excelData);
console.log('Field mappings:', app.fieldMappings);
```

## 🔐 Security

- All API calls use Trello's secure OAuth flow
- No data is stored permanently
- Excel files are processed client-side
- API tokens are managed by Trello

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Trello
5. Submit a Pull Request

### Areas for Contribution

- Additional field types
- Enhanced syntax parser
- Better error handling
- Mobile responsiveness improvements
- Accessibility enhancements

## 📞 Support

For support, please:
1. Check the troubleshooting section
2. Review existing issues on GitHub
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- **SheetJS Team**: For the excellent Excel parsing library
- **Trello**: For the Power-Up platform and APIs
- **Community**: For feedback and contributions

---

**Made with ❤️ for the Trello community**

*Transform your spreadsheets into actionable Trello cards with ease!*