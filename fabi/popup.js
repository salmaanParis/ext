document.getElementById('doneButton').addEventListener('click', async () => {
  const checkAllLinks = document.getElementById('checkAllLinks').checked;
  const checkBrokenLinks = document.getElementById('checkBrokenLinks').checked;
  const checkLocalLanguageLinks = document.getElementById('checkLocalLanguageLinks').checked;
  const checkAllDetails = document.getElementById('checkAllDetails').checked;
  const checkHeading = document.getElementById('checkHeading').checked;
  const ariaCheck = document.getElementById('ariaCheck').checked;
  const imageCheck = document.getElementById('imageCheck').checked;

  if (!checkAllLinks && !checkBrokenLinks && !checkLocalLanguageLinks && !checkAllDetails && !checkHeading && !ariaCheck && !imageCheck) {
    alert('Please check at least one checkbox.');
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url.startsWith('chrome://')) {
    alert('This extension cannot be run on chrome:// URLs.');
    return;
  }

  let countdownTime = 300; // Set countdown time in seconds (5 minutes)
  const countdownElement = document.getElementById('countdown');
  countdownElement.style.display = 'block'; // Ensure countdown element is visible
  updateCountdown(countdownElement, countdownTime);

  const countdownInterval = setInterval(() => {
    countdownTime -= 1;
    updateCountdown(countdownElement, countdownTime);

    if (countdownTime <= 0) {
      clearInterval(countdownInterval);
      countdownElement.textContent = 'Time is up!';
    }
  }, 1000);

  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: checkLinks,
      args: [checkAllLinks, checkBrokenLinks, checkLocalLanguageLinks, checkAllDetails, checkHeading, ariaCheck, imageCheck]
    });

    console.log('Link check result:', result); // Debugging

    if (result) {
      localStorage.setItem('linkResults', JSON.stringify(result));
      clearInterval(countdownInterval);
      countdownElement.textContent = 'Loading completed. Now you can download your files';
      alert('Completed');
    } else {
      alert('No result returned from the link check.');
    }
  } catch (error) {
    clearInterval(countdownInterval);
    countdownElement.textContent = '';
    console.error(error);
    alert('An error occurred while checking links.');
  }
});

function updateCountdown(element, time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  element.textContent = `Time remaining: ${minutes}m ${seconds}s`;
}

document.getElementById('previewButton').addEventListener('click', () => {
  const results = JSON.parse(localStorage.getItem('linkResults'));
  if (results) {
    document.getElementById('result').style.display = 'block';
    displayAllLinks(results.allLinks);
    displayBrokenLinks(results.brokenLinks);
    displayLocalLanguageLinks(results.localLanguageLinks);
    displayHeading(results.headingHierarchy);
    displayAria(results.ariaDetails);
    displayImages(results.imageDetails);
  } else {
    alert('No data to preview. Please click "Done" first.');
  }
});

document.getElementById('downloadExcelButton').addEventListener('click', () => {
  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "Link Report",
    Subject: "Link Checker",
    Author: "Your Name",
    CreatedDate: new Date()
  };
 /////////////////////////////////WORK-SHEET OF GENERATE XLSX DOWNLOAD////////////////////////////////////////////////////////-S
  // Convert all links to worksheet
  const allLinksData = [["", ""]].concat(
    Array.from(document.querySelectorAll('#allLinksTable tr')).map(row => {
      return Array.from(row.cells).map(cell => cell.textContent);
    })
  );
  const allLinksSheet = XLSX.utils.aoa_to_sheet(allLinksData);
  XLSX.utils.book_append_sheet(wb, allLinksSheet, "All Links");

  // Convert broken links to worksheet
  const brokenLinksData = [["", ""]].concat(
    Array.from(document.querySelectorAll('#brokenLinksTable tr')).map(row => {
      return Array.from(row.cells).map(cell => cell.textContent);
    })
  );
  const brokenLinksSheet = XLSX.utils.aoa_to_sheet(brokenLinksData);
  XLSX.utils.book_append_sheet(wb, brokenLinksSheet, "Broken Links");

  // Convert local language links to worksheet
  const localLanguageLinksData = [["", ""]].concat(
    Array.from(document.querySelectorAll('#localLanguageLinksTable tr')).map(row => {
      return Array.from(row.cells).map(cell => cell.textContent);
    })
  );
  const localLanguageLinksSheet = XLSX.utils.aoa_to_sheet(localLanguageLinksData);
  XLSX.utils.book_append_sheet(wb, localLanguageLinksSheet, "Local Language Links");

  XLSX.writeFile(wb, 'links_report.xlsx');
});
 /////////////////////////////////WORK-SHEET OF GENERATE XLSX DOWNLOAD////////////////////////////////////////////////////////-E


//compare functionalities////////////////////////////////////////////////////////

async function comparePages() {
  const targetUrl = document.getElementById('compare-url').value;
  if (!targetUrl) {
      alert('Please enter a URL to compare.');
      return;
  }

  let countdownTime = 300; // Set countdown time in seconds (5 minutes)
  const countdownElement = document.getElementById('countdown');
  countdownElement.style.display = 'block'; // Ensure countdown element is visible
  updateCountdown(countdownElement, countdownTime);

  const countdownInterval = setInterval(() => {
      countdownTime -= 1;
      updateCountdown(countdownElement, countdownTime);

      if (countdownTime <= 0) {
          clearInterval(countdownInterval);
          countdownElement.textContent = 'Time is up!';
          document.getElementById('loadingComplete').style.display = 'block'; // Show "Loading complete" message
      }
  }, 1000);

  // Fetch current page content
  const currentTab = await getCurrentTab();
  const currentUrl = currentTab.url;
  const currentResponse = await fetch(currentUrl);
  const currentPageHTML = await currentResponse.text();
  const currentDoc = new DOMParser().parseFromString(currentPageHTML, 'text/html');
  const currentPageContent = extractPageContent(currentDoc);

  // Fetch target page content
  const targetResponse = await fetch(targetUrl);
  const targetPageHTML = await targetResponse.text();
  const targetDoc = new DOMParser().parseFromString(targetPageHTML, 'text/html');
  const targetPageContent = extractPageContent(targetDoc);

  // Compare and display differences
  displayDifferences(currentPageContent, targetPageContent);
  document.getElementById('comparisonResults').style.display = 'block'; // Show the result section

  // Stop the timer and hide it
  clearInterval(countdownInterval);
  countdownElement.style.display = 'none';
}


document.getElementById('compare-button').addEventListener('click', comparePages);
document.getElementById('downloadExcelButton').addEventListener('click', downloadExcel);
////////////////////////////////////////////////////////////////////////////////////////
// async function comparePages() {
//   const targetUrl = document.getElementById('compare-url').value;
//   if (!targetUrl) {
//     alert('Please enter a URL to compare.');
//     return;
//   }

//   // Fetch current page content
//   const currentTab = await getCurrentTab();
//   const currentUrl = currentTab.url;
//   const currentResponse = await fetch(currentUrl);
//   const currentPageHTML = await currentResponse.text();
//   const currentDoc = new DOMParser().parseFromString(currentPageHTML, 'text/html');
//   const currentPageContent = extractPageContent(currentDoc);

//   // Fetch target page content
//   const targetResponse = await fetch(targetUrl);
//   const targetPageHTML = await targetResponse.text();
//   const targetDoc = new DOMParser().parseFromString(targetPageHTML, 'text/html');
//   const targetPageContent = extractPageContent(targetDoc);

//   // Compare and display differences
//   displayDifferences(currentPageContent, targetPageContent);
// }

async function getCurrentTab() {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      resolve(tabs[0]);
    });
  });
}

function extractPageContent(doc) {
  const content = {
    textFields: [],
    ariaLinks: [],
    images: [],
    metaTags:[]
  };

  doc.querySelectorAll('h1, h2, p, a').forEach(el => {
    content.textFields.push(el.innerText);
  });

  doc.querySelectorAll('[aria-label]').forEach(el => {
    content.ariaLinks.push({
      link: el.getAttribute('href'),
      label: el.getAttribute('aria-label'),
      target: el.getAttribute('target')
    });
  });

  doc.querySelectorAll('img').forEach(img => {
    content.images.push({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt')
    });
  });

  doc.querySelectorAll('meta').forEach(meta => {
    const tagName = meta.getAttribute('name') || meta.getAttribute('property') || meta.getAttribute('http-equiv');
    const contentValue = meta.getAttribute('content');

    if (tagName && contentValue) {
        content.metaTags.push({ tagName, contentValue });
    }
});

  return content;
}

function displayDifferences(current, target) {
  displayTable('text-comparison', current.textFields, target.textFields);
  displayTable('aria-comparison', current.ariaLinks, target.ariaLinks);
  displayTable('images-comparison', current.images, target.images);
  displayTable('meta-comparison', current.metaTags, target.metaTags);
}

function displayTable(tableId, currentData, targetData) {
  const tbody = document.getElementById(tableId).querySelector('tbody');
  tbody.innerHTML = '';

  const maxLength = Math.max(currentData.length, targetData.length);
  for (let i = 0; i < maxLength; i++) {
    const row = document.createElement('tr');
    const currentCell = document.createElement('td');
    const targetCell = document.createElement('td');

    const currentContent = currentData[i] ? JSON.stringify(currentData[i]) : '';
    const targetContent = targetData[i] ? JSON.stringify(targetData[i]) : '';

    currentCell.innerText = currentContent;
    targetCell.innerText = targetContent;

    if (currentContent !== targetContent) {
      // Highlight the cells where the content is different
      currentCell.style.backgroundColor = 'lightcoral';
      targetCell.style.backgroundColor = 'lightcoral';
    }

    row.appendChild(currentCell);
    row.appendChild(targetCell);
    tbody.appendChild(row);
  }
}

function downloadExcel() {
  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "Comparison Report",
    Subject: "Page Comparison",
    Author: "Your Name",
    CreatedDate: new Date()
  };

  /////////////////////////////////WORK-SHEET OF COMPARISON XLSX DOWNLOAD/////////////////////////////////////////////-S
  // Convert text fields comparison to worksheet
  const textComparisonData = [["Current Page", "Target Page"]].concat(
    Array.from(document.querySelectorAll('#text-comparison tbody tr')).map(row => {
      return Array.from(row.cells).map(cell => cell.textContent);
    })
  );
  const textComparisonSheet = XLSX.utils.aoa_to_sheet(textComparisonData);
  XLSX.utils.book_append_sheet(wb, textComparisonSheet, "Text Fields Comparison");

  // Convert aria-label links comparison to worksheet
  const ariaComparisonData = [["Current Page", "Target Page"]].concat(
    Array.from(document.querySelectorAll('#aria-comparison tbody tr')).map(row => {
      return Array.from(row.cells).map(cell => cell.textContent);
    })
  );
  const ariaComparisonSheet = XLSX.utils.aoa_to_sheet(ariaComparisonData);
  XLSX.utils.book_append_sheet(wb, ariaComparisonSheet, "ARIA-label Links Comparison");

  // Convert images comparison to worksheet
  const imagesComparisonData = [["Current Page", "Target Page"]].concat(
    Array.from(document.querySelectorAll('#images-comparison tbody tr')).map(row => {
      return Array.from(row.cells).map(cell => cell.textContent);
    })
  );
  const imagesComparisonSheet = XLSX.utils.aoa_to_sheet(imagesComparisonData);
  XLSX.utils.book_append_sheet(wb, imagesComparisonSheet, "Images Comparison");

  // Convert meta tag comparison to worksheet
  const metaComparisonData = [["Current Page", "Target Page"]].concat(
    Array.from(document.querySelectorAll('#meta-comparison tbody tr')).map(row => {
        return Array.from(row.cells).map(cell => cell.textContent);
    })
);
const metaComparisonSheet = XLSX.utils.aoa_to_sheet(metaComparisonData);
XLSX.utils.book_append_sheet(wb, metaComparisonSheet, "Meta Tags Comparison");

  XLSX.writeFile(wb, 'comparison_report.xlsx');
}
 /////////////////////////////////WORK-SHEET XLSX DOWNLOAD////////////////////////////////////////////////////////////-E
//clear Button
document.getElementById('clear').addEventListener('click', () => {
  localStorage.removeItem('linkResults');
  document.getElementById('result').style.display = 'none';
  document.getElementById('comparisonResults').style.display = 'none'; // Hide the result section after clearing
  
  // Uncheck all checkboxes/////////////////////////////////////////////////
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function displayAllLinks(links) {
  let html = '<table><tr><th>All Links</th><th>Status</th></tr>';
  links.forEach(link => {
    const statusColor = link.status === 200 ? 'green' : 'red';
    const linkClass = link.url.includes('#') ? 'highlighted-link' : ''; // Add class if URL contains '#'
    html += `<tr><td class="${linkClass}">${link.url}</td><td style="color: ${statusColor};">${link.status}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('allLinksTable').innerHTML = html;

}

function displayBrokenLinks(links) {
  let html = '<table><tr><th>Broken Links</th><th>Status</th></tr>';
  links.forEach(link => {
    const statusColor = link.status === 200 ? 'green' : 'red';
    html += `<tr><td>${highlightPercent20(link.url)}</td><td style="color: ${statusColor};">${link.status}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('brokenLinksTable').innerHTML = html;

}

function displayLocalLanguageLinks(links) {
  let html = '<table><thead><tr><th>Links</th><th>Region Specific</th><th>Link Text</th></tr></thead><tbody>';
  links.forEach(link => {
    const linkElement = document.createElement('a');
    linkElement.href = link.url;
    linkElement.textContent = link.text; // Extracting link text from the anchor element
    const linkText = linkElement.innerHTML; // Using innerHTML to get the rendered HTML content of the anchor element
    html += `<tr><td>${link.url}</td><td>${getLocalLanguageString(link.url)}</td><td>${linkText}</td></tr>`;
  });
  html += '</tbody></table>';
  document.getElementById('localLanguageLinksTable').innerHTML = html;
}

function displayHeading(headings) {
  if (headings && headings.length > 0) {
    let headingHtml = '<table><tr><th>Heading Tag</th><th>Text</th></tr>';
    headings.forEach(heading => {
      headingHtml += `<tr><td>${heading.tag}</td><td>${heading.text}</td></tr>`;
    });
    headingHtml += '</table>';
    document.getElementById('headingTable').innerHTML = headingHtml;

  }
}

function displayAria(ariaDetails) {
  let html = '<table><tr><th>Element</th><th>ARIA Label</th><th>Link</th><th>Target</th></tr>';
  ariaDetails.forEach(detail => {
    html += `<tr><td>${detail.element}</td><td>${detail.ariaLabel}</td><td>${detail.link}</td><td>${detail.target}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('ariaTable').innerHTML = html;
}

function displayImages(imageDetails) {
  let html = '<table><tr><th>Image Source</th><th>Alt Text</th></tr>';
  imageDetails.forEach(detail => {
    html += `<tr><td>${detail.src}</td><td>${detail.alt}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('imageTable').innerHTML = html;
}


function getLocalLanguageString(url) {
  const localLanguageList = [
    'en-us', 'en-au', 'en-ca', 'en-gb', 'en-hk', 'en-ie', 'en-in', 'en-my', 'en-nz', 'en-ph', 'en-sg', 'en-za', 'es-es',
    'es-mx', 'fr-be', 'fr-ca', 'fr-fr', 'it-it', 'ko-kr', 'pt-br', 'de-de', 'ar-sa', 'da-dk', 'fi-fi', 'ja-jp', 'nb-no',
    'nl-be', 'nl-nl', 'zh-cn'
  ];
  for (const language of localLanguageList) {
    if (url.includes(language)) {
      return language;
    }
  }
  return 'unknown';
}

function highlightPercent20(url) {
  return url.replace(/%20/g, '<span style="color: red;">%20</span>');
}

async function checkLinks(checkAllLinks, checkBrokenLinks, checkLocalLanguageLinks, checkAllDetails, checkHeading, ariaCheck, imageCheck) {
  const allLinks = [];
  const brokenLinks = [];
  const localLanguageLinks = [];
  const localLanguageList = [
    'en-us', 'en-au', 'en-ca', 'en-gb', 'en-hk', 'en-ie', 'en-in', 'en-my', 'en-nz', 'en-ph', 'en-sg', 'en-za', 'es-es',
    'es-mx', 'fr-be', 'fr-ca', 'fr-fr', 'it-it', 'ko-kr', 'pt-br', 'de-de', 'ar-sa', 'da-dk', 'fi-fi', 'ja-jp', 'nb-no',
    'nl-be', 'nl-nl', 'zh-cn'
  ];
  const headingHierarchy = [];
  const ariaDetails = [];
  const imageDetails = [];

  const links = Array.from(document.querySelectorAll('a')).map(link => ({
    url: link.href,
    text: link.textContent 
  }));

  for (const link of links) {
    try {
      const response = await fetch(link.url);
      const status = response.status;

      if (checkAllLinks || checkAllDetails) allLinks.push({ url: link.url, status });

      if ((checkBrokenLinks || checkAllDetails) && (status === 400 || status === 404 || status === 410 || status === 502 || status === 408 || status === 503 || link.url.includes('%20'))) {
        brokenLinks.push({ url: link.url, status });
      }

      if ((checkLocalLanguageLinks || checkAllDetails) && localLanguageList.some(language => link.url.includes(language))) {
        localLanguageLinks.push(link);
      }

    } catch (error) {
      console.log(error);
    }
  }

  if (checkHeading || checkAllDetails) {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(heading => ({
      tag: heading.tagName.toLowerCase(),
      text: heading.textContent.trim()
    }));
    headingHierarchy.push(...headings);
  }

  if (ariaCheck || checkAllDetails) {
    const ariaElements = Array.from(document.querySelectorAll('[aria-label]')).map(element => ({
      element: element.tagName.toLowerCase(),
      ariaLabel: element.getAttribute('aria-label'),
      target: element.getAttribute('href') || element.getAttribute('target') || '',
      link: element.href || element.closest('a')?.href || ''
    }));
    ariaDetails.push(...ariaElements);
  }

  if (imageCheck || checkAllDetails) {
    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt || 'No alt text'
    }));
    imageDetails.push(...images);
  }

  return { allLinks, brokenLinks, localLanguageLinks, headingHierarchy, ariaDetails, imageDetails };
  }















/////////////////////////////////////////////////////////////////////////////
  document.addEventListener('DOMContentLoaded', function() {
    const nightModeButton = document.getElementById('nightModeButton');
    const body = document.body;
  
    nightModeButton.addEventListener('click', function() {
      // Toggle night mode class on body
      body.classList.toggle('night-mode');
      // Change button text and symbol based on night mode state
      if (body.classList.contains('night-mode')) {
        nightModeButton.innerHTML = '<i class="fas fa-sun"></i> ';
      } else {
        nightModeButton.innerHTML = '<i class="fa-solid fa-moon"></i> ';
      }
    });
  });
  /////////////////////////////////////////////////////////////////////////////////
  