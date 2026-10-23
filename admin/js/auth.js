// admin/js/auth.js
async function login(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true };
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
}

async function checkSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) window.location.href = 'index.html';
}