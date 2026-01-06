const sb = supabase.createClient(
  "https://mefzopeenhfdqfatbjaq.supabase.co",
  "sb_publishable_LU94dUJoW2jwZJ9WIdfsMw_lEnMQobx"
);

let currentUser = null;

// === АВТОЛОГІН ===
document.addEventListener("DOMContentLoaded", async () => {
  const { data:{ user } } = await sb.auth.getUser();
  if(user){
    await loadBankUser(user);
  }
});

// === LOGIN (AUTH) ===
async function login(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password
  });

  if(error){
    alert("❌ Невірний email або пароль");
    return;
  }

  await loadBankUser(data.user);
}

// === LOAD / CREATE BANK USER ===
async function loadBankUser(user){
  // шукаємо в bank
  let { data, error } = await sb
    .from("bank")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // якщо НЕМАЄ — створюємо
  if(!data){
    const newIdd = Math.floor(100000 + Math.random() * 900000);

    const { data: created } = await sb.from("bank").insert({
      user_id: user.id,
      name: user.email.split("@")[0],
      idd: newIdd,
      balance: 0,
      is_admin: false,
      is_vip_user: false
    }).select().single();

    data = created;
  }

  currentUser = data;

  // показуємо UI
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("userBox").classList.remove("hidden");

  document.getElementById("name").innerText = data.name;
  document.getElementById("idd").innerText = data.idd;
  document.getElementById("balance").innerText = data.balance;
}

// === LOGOUT ===
async function logout(){
  await sb.auth.signOut();
  location.reload();
}

// === НАВІГАЦІЯ ===
function go(p){ location.href = p; }

// === PRIVAT ===
function openPrivat(){
  window.open("https://www.privat24.ua/send/ijak6", "_blank");
}
