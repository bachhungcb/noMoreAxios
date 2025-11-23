const API_URL = 'https://jsonplaceholder.typicode.com/users';

//State (Data sate)
let localUsers = [] // array for storing users data
let currentPage = 1
const rowsPerPage = 5;
let currentEditId = null; // Flag for indicating Create mode or edit mode

// 1. READ: Get data from API when loading page
document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch response');
        localUsers = await response.json();
        renderTable();
    } catch (error) {
        alert('Error Loading data: ' + error.message);
    }
}

// Render table function (Display data + pagination + Search)
function renderTable() {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';

    // Filter data by search
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const filterdUsers = localUsers.filter(user =>
        user.name.toLowerCase().includes(keyword));

    // Calculate pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedUsers = filterdUsers.slice(startIndex, endIndex);

    // Render each line
    paginatedUsers.forEach(user => {
        const row = `
        <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>
                    <button class="btn-edit" onclick="openModal('edit', ${user.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteUser(${user.id})">Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // Update pagination display result
    document.getElementById('pageIndicator').innerText = `Page ${currentPage}`;
}

// 2. CREATE & UPDATE: handle form submit
document.getElementById('userForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const phone = document.getElementById('userPhone').value;

    // cloae modal
    closeModal();

    try {
        if (currentEditId) {
            // --- UPDATE (PUT) ---
            await fetch(`${API_URL}/${currentEditId}`, {
                method: 'PUT',
                body: JSON.stringify({id: currentEditId, name, email, phone}),
                headers: {'Content-type': 'application/json; charset=UTF-8'},
            });

            // Update UI Manually: Tìm user trong mảng và sửa
            const index = localUsers.findIndex(u => u.id === currentEditId);
            if (index !== -1) {
                localUsers[index] = {...localUsers[index], name, email, phone};
            }
            alert('User updated successfully (Fake)');

        } else {
            // --- CREATE (POST) ---
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({name, email, phone}),
                headers: {'Content-type': 'application/json; charset=UTF-8'},
            });
            const data = await res.json();

            // Update UI Manually: Thêm vào đầu hoặc cuối mảng
            // Lưu ý: JSONPlaceholder luôn trả về ID 11 cho item mới
            const newUser = {...data, id: localUsers.length + 100}; // Fake ID để không trùng
            localUsers.unshift(newUser);
            alert('User created successfully (Fake)');
        }

        renderTable(); // Vẽ lại bảng
    } catch (error) {
        console.error(error);
        alert('Error processing request');
    }
});

// 3. DELETE: Xóa user
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

        // Update UI Manually: Lọc bỏ user đó khỏi mảng
        localUsers = localUsers.filter(user => user.id !== id);

        // Nếu trang hiện tại trống sau khi xóa, lùi về trang trước
        if ((currentPage - 1) * rowsPerPage >= localUsers.length && currentPage > 1) {
            currentPage--;
        }

        renderTable();
        alert('User deleted successfully (Fake)');
    } catch (error) {
        alert('Error deleting user');
    }
}

// ---- HELPER FUNCTIONS ----
// Xử lý Search
function handleSearch() {
    currentPage = 1; // Reset về trang 1 khi search
    renderTable();
}

// Xử lý Pagination
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    // Kiểm tra xem còn trang sau không dựa trên dữ liệu đã lọc
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const filteredUsers = localUsers.filter(user => user.name.toLowerCase().includes(keyword));

    if ((currentPage * rowsPerPage) < filteredUsers.length) {
        currentPage++;
        renderTable();
    }
}

// Xử lý Modal (Mở/Đóng)
function openModal(mode, id = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('userForm');

    modal.style.display = 'block';
    currentEditId = id;

    if (mode === 'edit') {
        title.innerText = 'Edit User';
        // Fill dữ liệu cũ vào form
        const user = localUsers.find(u => u.id === id);
        if (user) {
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userPhone').value = user.phone;
        }
    } else {
        title.innerText = 'Add New User';
        form.reset(); // Xóa trắng form
    }
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Đóng modal khi click ra ngoài
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target == modal) {
        closeModal();
    }
}