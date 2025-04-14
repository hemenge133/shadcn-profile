# haydenmenge.com Content Analysis

## Website Structure
The current website has a simple, minimalist structure with:
- Header with name
- Social media icons
- Card-based sections for different content areas
- Clean, responsive design
- Dark/light theme toggle

## Content Sections

### 1. Header and Social Links
- Name: Hayden Menge
- Social links:
  - Email: me@haydenmenge.com
  - LinkedIn: https://linkedin.com/in/hayden-menge-548590167/
  - GitHub: https://github.com/hemenge133
- Theme toggle button

### 2. Education
- The University of Florida, B.Sc in Computer Engineering '21

### 3. Technologies
- Programming: Java, Python, C, C++, SQL
- Web: React, AWS, HTML, CSS, JS/TS
- AI/ML: PyTorch, OpenCV
- Systems: Linux/UNIX

### 4. Experience
- AWS - Software Development Engineer, 2022-2023
- UF ML Lab - Software Engineer, 2021-2022
- Total Experience: 2 years 6 months

### 5. Project Demos
- conversegptapp.net - [source: https://github.com/hemenge133/converseGPT]
  - Project is now deprecated due to OpenAI's Custom GPTs
  - Was a GPT-based chat app with infrastructure-as-code backend
  - Used langchain for extensibility
  - Had features for customization and scaling

## Design System

### Typography
- Primary font: 'Inconsolata', monospace
- Font sizes:
  - Name (h1): calc(42px + .3vw)
  - Section titles (h2): calc(24px + .3vw)
  - Body text: calc(11px + .3vw)
  - Links in list: calc(16px + .3vw)
  - Icons: calc(24px + .3vw)
- Font weights:
  - Headers: 900
  - Body: 200

### Color Scheme
- Dark theme (default):
  - Background: #222
  - Text: #fff
  - Card background: #333
  - Links: lightblue
  - Icons: rgba(255, 255, 255, 0.6), hover: rgba(255, 255, 255, 0.9)
- Light theme:
  - Background: #fff
  - Text: #222
  - Card background: #fff
  - Links: darkblue
  - Icons: rgba(0, 0, 0, 0.6), hover: rgba(0, 0, 0, 0.9)

### Layout
- Content max-width: 800px
- Card structure:
  - Border radius: 15px
  - Margin: 20px auto
  - Padding: 20px
  - Box shadow: 0 0 10px rgba(0, 0, 0, 0.1)
- Spacing:
  - Padding between list items: 10px
  - Padding top for name: 7vw
  - Icon container padding bottom: 40px

## Optimization Features
- Preloading of fonts and styles
- Inline critical CSS
- Fallbacks for when JavaScript is disabled (noscript)
- Responsive design (viewport meta tag)
- Fast-loading page with minimal assets

## Items to Preserve
1. The minimalist, clean aesthetic
2. Dark/light theme toggle functionality
3. Card-based content organization
4. Responsive design principles
5. Performance optimization techniques

## Items to Enhance
1. Add more personal information/bio
2. Expand the project section with more details and additional projects
3. Add more detailed descriptions of work experience
4. Include a dedicated contact form
5. Add a skills visualization component
6. Consider adding a blog section
7. Implement animations for better user engagement

## Assets to Recreate
1. Favicon and touch icons
2. Social media icons (currently using FontAwesome)
3. Project screenshots (GitHub repository images)

## Technical Implementations
1. The theme toggle uses a simple JavaScript function that toggles CSS classes
2. No backend or complex functionality - purely static site
3. No navigation - single page layout
4. No form handling 