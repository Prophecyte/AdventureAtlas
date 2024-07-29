document.addEventListener('DOMContentLoaded', (event) => {
  showDefaultPage();
});

let contextMenuTarget;
let selectedIcon = '';
let currentContentId = '';
let selectedSize = '';

function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName('tabcontent');
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].classList.remove('active');
  }
  tablinks = document.getElementsByClassName('tablinks');
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  }
  document.getElementById(tabName).classList.add('active');
  evt.currentTarget.className += ' active';

  document.querySelector('.sidebar').style.display = 'flex';
  document.querySelector('.add-item-btn').style.display = 'block';
}

function showContent(contentId) {
  var i, content;
  content = document.getElementsByClassName('content');
  for (i = 0; i < content.length; i++) {
    content[i].classList.remove('active');
  }
  document.getElementById(contentId).classList.add('active');
  currentContentId = contentId;
}

function toggleNested(element) {
  const item = element.parentElement.parentElement;
  item.classList.toggle('expanded');
  if (item.classList.contains('expanded')) {
    element.innerHTML = '&#9660;'; // Downward arrow
  } else {
    element.innerHTML = '&#9654;'; // Rightward arrow
  }
  updateArrows();
}

function allowDrop(event) {
  event.preventDefault();
}

function drag(event) {
  event.dataTransfer.setData('text', event.target.id);
  event.target.classList.add('dragging');
}

function drop(event) {
  event.preventDefault();
  var data = event.dataTransfer.getData('text');
  var draggingElement = document.getElementById(data);
  var dropTarget = event.target;

  while (
    !dropTarget.classList.contains('sidebar') &&
    !dropTarget.classList.contains('tabcontent') &&
    !dropTarget.classList.contains('item') &&
    !dropTarget.classList.contains('nested-content')
  ) {
    dropTarget = dropTarget.parentNode;
  }

  if (draggingElement !== dropTarget) {
    if (
      dropTarget.classList.contains('nested-content') ||
      dropTarget.classList.contains('sidebar') ||
      dropTarget.classList.contains('tabcontent')
    ) {
      dropTarget.appendChild(draggingElement);
    } else if (dropTarget.classList.contains('item')) {
      let nestedContent = dropTarget.querySelector('.nested-content');
      if (!nestedContent) {
        nestedContent = document.createElement('div');
        nestedContent.className = 'nested-content';
        nestedContent.ondrop = drop;
        nestedContent.ondragover = allowDrop;
        dropTarget.appendChild(nestedContent);
      }
      nestedContent.appendChild(draggingElement);
    }
  }

  draggingElement.classList.remove('dragging');
  updateArrows();
}

function updateArrows() {
  document.querySelectorAll('.item').forEach((item) => {
    const arrow = item.querySelector('.arrow');
    const nestedContent = item.querySelector('.nested-content');
    if (nestedContent && nestedContent.children.length > 0) {
      arrow.style.display = 'inline';
    } else {
      arrow.style.display = 'none';
    }
  });
}

function addItem() {
  const activeTab = document.querySelector('.tabcontent.active');
  if (activeTab) {
    const newItemId = 'item-' + Math.random().toString(36).substr(2, 9);
    const newItemContentId =
      'Content-' + Math.random().toString(36).substr(2, 9);

    const newItem = document.createElement('div');
    newItem.className = 'item';
    newItem.id = newItemId;
    newItem.draggable = true;
    newItem.dataset.contentId = newItemContentId;
    newItem.ondragstart = drag;
    newItem.innerHTML = `<div class="item-header"><div class="arrow" onclick="toggleNested(this)">&#9654;</div><div class="item-text">New Item</div></div>`;

    const newNestedContent = document.createElement('div');
    newNestedContent.className = 'nested-content';
    newNestedContent.ondrop = drop;
    newNestedContent.ondragover = allowDrop;
    newItem.appendChild(newNestedContent);

    newItem.addEventListener('click', (event) => {
      event.stopPropagation();
      showContent(newItemContentId);
    });

    newItem.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      showContextMenu(event, newItem);
    });

    activeTab.appendChild(newItem);

    const newContent = document.createElement('div');
    newContent.id = newItemContentId;
    newContent.className = 'content';
    newContent.innerHTML = `<div class="image-icon" onclick="showImageUploadModal('${newItemContentId}')">🖼️</div>
                                <button class="add-content-block-btn" onclick="showContentBlockModal()">Add Content Block</button>`;
    document.querySelector('.content-area').appendChild(newContent);

    updateArrows();
    setupContextMenuListeners(newItem);
  }
}

function showAddTabModal() {
  document.getElementById('addTabModal').style.display = 'flex';
}

function closeAddTabModal() {
  document.getElementById('addTabModal').style.display = 'none';
}

function selectIcon(icon) {
  selectedIcon = icon;
  document.querySelectorAll('.icon-option').forEach((option) => {
    option.classList.remove('selected');
  });
  event.target.classList.add('selected');
}

function addTab() {
  if (!selectedIcon) {
    alert('Please select an icon for the new tab.');
    return;
  }
  const tabName = document.getElementById('tabName').value || 'New Tab';
  const tabCount = document.querySelectorAll('.tablinks').length;
  const newTabId = 'Tab' + (tabCount + 1);
  const newTabContentId = 'ContentTab' + (tabCount + 1);

  const newTabButton = document.createElement('button');
  newTabButton.className = 'tablinks';
  newTabButton.innerHTML = selectedIcon;
  newTabButton.title = tabName;
  newTabButton.onclick = function (event) {
    openTab(event, newTabId);
  };
  document
    .querySelector('.tabs')
    .insertBefore(newTabButton, document.querySelector('.add-tab-btn'));

  const newTabContent = document.createElement('div');
  newTabContent.id = newTabId;
  newTabContent.className = 'tabcontent';
  document.querySelector('.sidebar').appendChild(newTabContent);

  const newContentArea = document.createElement('div');
  newContentArea.id = newTabContentId;
  newContentArea.className = 'content';
  newContentArea.innerHTML = `<div class="image-icon" onclick="showImageUploadModal('${newTabContentId}')">🖼️</div>
                                <button class="add-content-block-btn" onclick="showContentBlockModal()">Add Content Block</button>`;
  document.querySelector('.content-area').appendChild(newContentArea);

  closeAddTabModal();
}

function showContextMenu(event, target) {
  event.stopPropagation(); // Ensure that the event doesn't propagate to the parent
  contextMenuTarget = target;
  const contextMenu = document.getElementById('contextMenu');
  contextMenu.style.display = 'block';
  contextMenu.style.left = `${event.pageX}px`;
  contextMenu.style.top = `${event.pageY}px`;
}

function hideContextMenu() {
  document.getElementById('contextMenu').style.display = 'none';
}

function createItem() {
  const newItemId = 'item-' + Math.random().toString(36).substr(2, 9);
  const newItemContentId = 'Content-' + Math.random().toString(36).substr(2, 9);

  const newItem = document.createElement('div');
  newItem.className = 'item';
  newItem.id = newItemId;
  newItem.draggable = true;
  newItem.dataset.contentId = newItemContentId;
  newItem.ondragstart = drag;
  newItem.innerHTML = `<div class="item-header"><div class="arrow" onclick="toggleNested(this)">&#9654;</div><div class="item-text">New Item</div></div>`;

  const newNestedContent = document.createElement('div');
  newNestedContent.className = 'nested-content';
  newNestedContent.ondrop = drop;
  newNestedContent.ondragover = allowDrop;
  newItem.appendChild(newNestedContent);

  newItem.addEventListener('click', (event) => {
    event.stopPropagation();
    showContent(newItemContentId);
  });

  newItem.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    showContextMenu(event, newItem);
  });

  const nestedContent = contextMenuTarget.querySelector('.nested-content');
  nestedContent.appendChild(newItem);

  const newContent = document.createElement('div');
  newContent.id = newItemContentId;
  newContent.className = 'content';
  newContent.innerHTML = `<div class="image-icon" onclick="showImageUploadModal('${newItemContentId}')">🖼️</div>
                            <button class="add-content-block-btn" onclick="showContentBlockModal()">Add Content Block</button>`;
  document.querySelector('.content-area').appendChild(newContent);

  updateArrows();
  setupContextMenuListeners(newItem);
  hideContextMenu();
}

function renameItem() {
  const currentText = contextMenuTarget.querySelector('.item-text');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText.textContent.trim();
  input.classList.add('rename-input');

  input.addEventListener('blur', () => {
    currentText.textContent = input.value.trim();
    input.replaceWith(currentText); // Replace the input with the updated text span
    hideContextMenu();
  });

  input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      input.blur();
    }
  });

  currentText.replaceWith(input); // Replace the text span with the input
  input.focus();
}

function duplicateItem() {
  const duplicate = contextMenuTarget.cloneNode(true);
  const newItemId = 'item-' + Math.random().toString(36).substr(2, 9);
  const newItemContentId = 'Content-' + Math.random().toString(36).substr(2, 9);

  duplicate.id = newItemId;
  duplicate.dataset.contentId = newItemContentId;

  duplicate.querySelectorAll('.item').forEach((item) => {
    item.id = 'item-' + Math.random().toString(36).substr(2, 9);
    item.dataset.contentId =
      'Content-' + Math.random().toString(36).substr(2, 9);
  });

  duplicate.querySelectorAll('.nested-content').forEach((nested) => {
    nested.ondrop = drop;
    nested.ondragover = allowDrop;
  });

  contextMenuTarget.parentNode.appendChild(duplicate);

  const newContent = document.createElement('div');
  newContent.id = newItemContentId;
  newContent.className = 'content';
  newContent.innerHTML = `<div class="image-icon" onclick="showImageUploadModal('${newItemContentId}')">🖼️</div>
                            <button class="add-content-block-btn" onclick="showContentBlockModal()">Add Content Block</button>`;
  document.querySelector('.content-area').appendChild(newContent);

  updateArrows();
  setupContextMenuListeners(duplicate);
  hideContextMenu();
}

function deleteItem() {
  const contentId = contextMenuTarget.dataset.contentId;
  contextMenuTarget.remove();
  document.getElementById(contentId).remove();
  updateArrows();
  hideContextMenu();
}

document.addEventListener('click', hideContextMenu);

function setupContextMenuListeners(item) {
  item.addEventListener('click', (event) => {
    event.stopPropagation();
    showContent(item.getAttribute('data-content-id'));
  });
  item.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    showContextMenu(event, item);
  });

  const nestedItems = item.querySelectorAll('.item');
  nestedItems.forEach((nestedItem) => {
    nestedItem.addEventListener('click', (event) => {
      event.stopPropagation();
      showContent(nestedItem.getAttribute('data-content-id'));
    });
    nestedItem.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      showContextMenu(event, nestedItem);
    });
  });
}

document.querySelectorAll('.item').forEach((item) => {
  setupContextMenuListeners(item);
});

updateArrows();

function showDefaultPage() {
  var i, content;
  content = document.getElementsByClassName('content');
  for (i = 0; i < content.length; i++) {
    content[i].classList.remove('active');
  }
  document.getElementById('defaultContent').classList.add('active');

  document.querySelector('.sidebar').style.display = 'flex';
  document.querySelector('.tabs').style.display = 'flex';
  document.querySelector('.add-item-btn').style.display = 'none'; // Hide the add item button by default
  document
    .querySelectorAll('.tablinks')
    .forEach((tab) => tab.classList.remove('active'));

  var tabcontent = document.getElementsByClassName('tabcontent');
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].classList.remove('active');
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const tabs = document.querySelector('.tabs');
  const addItemBtn = document.querySelector('.add-item-btn');
  if (sidebar.style.display === 'none') {
    sidebar.style.display = 'flex';
    tabs.style.display = 'flex';
    addItemBtn.style.display = 'block';
  } else {
    sidebar.style.display = 'none';
    tabs.style.display = 'none';
    addItemBtn.style.display = 'none';
  }
}

function showImageUploadModal(contentId) {
  currentContentId = contentId;
  document.getElementById('imageUploadModal').style.display = 'flex';
}

function closeImageUploadModal() {
  document.getElementById('imageUploadModal').style.display = 'none';
}

function allowImageDrop(event) {
  event.preventDefault();
}

document
  .getElementById('imageDropArea')
  .addEventListener('dragover', allowImageDrop);

document
  .getElementById('imageDropArea')
  .addEventListener('drop', function (event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      document.getElementById('imageInput').files = files;
    }
  });

function saveImage() {
  const fileInput = document.getElementById('imageInput');
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.style.width = '100%';
        img.style.objectFit = 'cover';

        const content = document.getElementById(currentContentId);
        content.innerHTML = `<button class="add-content-block-btn" onclick="showContentBlockModal()">Add Content Block</button>`;
        content.prepend(img);

        const optionsBtn = document.createElement('button');
        optionsBtn.className = 'image-options-btn';
        optionsBtn.textContent = '⚙️';
        optionsBtn.onclick = function (event) {
          event.preventDefault();
          showImageOptionsMenu(event, content);
        };
        content.appendChild(optionsBtn);

        if (selectedSize) {
          resizeBanner(selectedSize);
        } else {
          resizeBanner('medium'); // Default size if none is selected
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file.');
    }
  }
  closeImageUploadModal();
}

function resizeBanner(size) {
  const content = document.getElementById(currentContentId);
  content.className = 'content ' + size + ' active';
}

function selectBannerSize(size) {
  selectedSize = size;
  document.querySelectorAll('.size-button').forEach((button) => {
    button.classList.remove('selected');
  });
  document
    .querySelector(`.size-button[onclick="selectBannerSize('${size}')"]`)
    .classList.add('selected');
}

function showImageOptionsMenu(event, target) {
  event.stopPropagation();
  const optionsMenu = document.getElementById('imageOptionsMenu');
  optionsMenu.style.display = 'block';
  optionsMenu.style.left = `${event.pageX}px`;
  optionsMenu.style.top = `${event.pageY}px`;

  const menuWidth = optionsMenu.offsetWidth;
  const windowWidth = window.innerWidth;

  if (event.pageX + menuWidth > windowWidth) {
    optionsMenu.style.left = `${windowWidth - menuWidth - 10}px`;
  }

  currentContentId = target.id;
}

function hideImageOptionsMenu() {
  document.getElementById('imageOptionsMenu').style.display = 'none';
}

function removeImage() {
  const content = document.getElementById(currentContentId);
  content.innerHTML = `<div class="image-icon" onclick="showImageUploadModal('${currentContentId}')">🖼️</div>
                         <button class="add-content-block-btn" onclick="showContentBlockModal()">Add Content Block</button>`;
  hideImageOptionsMenu();
}

document.addEventListener('click', hideImageOptionsMenu);

function showContentBlockModal() {
  document.getElementById('contentBlockModal').style.display = 'flex';
}

function closeContentBlockModal() {
  document.getElementById('contentBlockModal').style.display = 'none';
}

function addContentBlock(blockType) {
  if (blockType === 'Text Editor') {
    addTextEditor();
  }
  closeContentBlockModal();
}

function addTextEditor() {
  const content = document.getElementById(currentContentId);
  const editorContainer = document.createElement('div');
  editorContainer.className = 'editor-container';

  const editor = document.createElement('div');
  editor.className = 'editor';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-btn';
  saveBtn.textContent = 'Save';
  saveBtn.onclick = function () {
    saveTextEditor(editorContainer, editor);
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.onclick = function () {
    editorContainer.remove();
  };

  editorContainer.appendChild(editor);
  editorContainer.appendChild(saveBtn);
  editorContainer.appendChild(deleteBtn);

  content.insertBefore(
    editorContainer,
    content.querySelector('.add-content-block-btn')
  );

  createCustomEditor(editor);
}

function createCustomEditor(editor) {
  editor.innerHTML = `
    <div class="toolbar">
        <select id="formatBlock">
            <option value="p">Paragraph</option>
            <option value="h1">Header 1</option>
            <option value="h2">Header 2</option>
            <option value="h3">Header 3</option>
        </select>
        <select id="fontSize">
            <option value="1">Small</option>
            <option value="3">Normal</option>
            <option value="5">Large</option>
        </select>
        <select id="fontName">
            <option value="Arial">Arial</option>
            <option value="Courier">Courier</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
        </select>
        <button onclick="format('bold')">Bold</button>
        <button onclick="format('italic')">Italic</button>
        <button onclick="format('underline')">Underline</button>
        <input type="color" id="foreColor" onchange="setColor('foreColor', this.value)">
        <input type="color" id="hiliteColor" onchange="setColor('hiliteColor', this.value)">
        <button onclick="format('justifyLeft')">Left Align</button>
        <button onclick="format('justifyCenter')">Center Align</button>
        <button onclick="format('justifyRight')">Right Align</button>
        <button onclick="insertImage()">Insert Image</button>
        <button onclick="insertTable()">Insert Table</button>
    </div>
    <div id="editor" contenteditable="true"></div>
  `;

  document
    .getElementById('formatBlock')
    .addEventListener('change', function () {
      document.execCommand('formatBlock', false, this.value);
    });

  document.getElementById('fontSize').addEventListener('change', function () {
    document.execCommand('fontSize', false, this.value);
  });

  document.getElementById('fontName').addEventListener('change', function () {
    document.execCommand('fontName', false, this.value);
  });
}

function format(command, value) {
  document.execCommand(command, false, value);
}

function setColor(command, value) {
  document.execCommand(command, false, value);
}

function insertImage() {
  const url = prompt('Enter the image URL');
  if (url) {
    document.execCommand('insertImage', false, url);
  }
}

function insertTable() {
  const editor = document.getElementById('editor');
  let table = '<table border="1">';
  for (let i = 0; i < 3; i++) {
    table += '<tr>';
    for (let j = 0; j < 3; j++) {
      table += '<td contenteditable="true">&nbsp;</td>';
    }
    table += '</tr>';
  }
  table += '</table>';
  editor.focus();
  document.execCommand('insertHTML', false, table);
  enableTableResizing();
}

function enableTableResizing() {
  const tables = document.querySelectorAll('#editor table');
  tables.forEach((table) => {
    const cols = table.querySelectorAll('td, th');
    cols.forEach((col) => {
      const resizer = document.createElement('div');
      resizer.className = 'resize-handle';
      col.appendChild(resizer);
      resizer.addEventListener('mousedown', initResize);
    });
  });
}

function initResize(e) {
  const col = e.target.parentElement;
  const startX = e.pageX;
  const startWidth = col.offsetWidth;
  const table = col.closest('table');

  const doDrag = (e) => {
    col.style.width = startWidth + (e.pageX - startX) + 'px';
    table.style.tableLayout = 'auto';
  };

  const stopDrag = () => {
    document.removeEventListener('mousemove', doDrag);
    document.removeEventListener('mouseup', stopDrag);
    table.style.tableLayout = 'fixed';
  };

  document.addEventListener('mousemove', doDrag);
  document.addEventListener('mouseup', stopDrag);
}

function saveTextEditor(editorContainer, editor) {
  const editorInstance = editor.querySelector('#editor');
  const html = editorInstance.innerHTML;
  editorContainer.innerHTML = html;

  const editBtn = document.createElement('button');
  editBtn.className = 'edit-btn';
  editBtn.textContent = 'Edit';
  editBtn.onclick = function () {
    editTextEditor(editorContainer, html);
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.onclick = function () {
    editorContainer.remove();
  };

  editorContainer.appendChild(editBtn);
  editorContainer.appendChild(deleteBtn);
}

function editTextEditor(editorContainer, html) {
  editorContainer.innerHTML = '';

  const editor = document.createElement('div');
  editor.className = 'editor';
  editor.innerHTML = html;

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-btn';
  saveBtn.textContent = 'Save';
  saveBtn.onclick = function () {
    saveTextEditor(editorContainer, editor);
  };

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.onclick = function () {
    editorContainer.remove();
  };

  editorContainer.appendChild(editor);
  editorContainer.appendChild(saveBtn);
  editorContainer.appendChild(deleteBtn);

  createCustomEditor(editor);
  editor.querySelector('#editor').innerHTML = html;
  enableTableResizing();
}
