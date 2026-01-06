const sb = supabase.createClient(
  "https://mefzopeenhfdqfatbjaq.supabase.co",
  "sb_publishable_LU94dUJoW2jwZJ9WIdfsMw_lEnMQobx"
);

let userData = null;

async function login(){
  const email = email.value;
  const password = document.getElementById("password").value;

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if(error) return alert(error.message);

  loadUser();
}

async function loadUser(){
  const { data:{user} } = await sb.auth.getUser();
  if(!user) return;

  const { data } = await sb.from("bank").select("*").eq("user_id", user.id).single();
  userData = data;

  if(document.getElementById("name")){
    name.innerText = data.name;
    idd.innerText = data.idd;
    balance.innerText = data.balance;
    role.innerText = data.is_admin ? "👑 ADMIN" : data.is_vip_user ? "⭐ VIP" : "";
  }
}

async function buy(title, price){
  if(userData.balance < price) return alert("❌ Недостатньо коштів");

  const discount = userData.is_vip_user ? 0.2 : 0;
  const final = Math.floor(price * (1-discount));

  await sb.from("bank").update({ balance: userData.balance-final })
    .eq("id", userData.id);

  alert(`✔ Куплено: ${title} за ${final}`);
  location.reload();
}

async function transfer(){
  const to = toId.value;
  const sum = Number(amount.value);

  if(sum <= 0 || sum > userData.balance) return alert("❌ Помилка суми");

  const { data:toUser } = await sb.from("bank").select("*").eq("idd", to).single();
  if(!toUser) return alert("❌ ID не знайдено");

  if(!confirm(`Переказати ${sum} → ${toUser.name}?`)) return;

  await sb.from("bank").update({ balance: userData.balance-sum }).eq("id", userData.id);
  await sb.from("bank").update({ balance: toUser.balance+sum }).eq("id", toUser.id);

  alert("✔ Успішно");
  location.href="index.html";
}

function openPrivat(){
  window.open("https://www.privat24.ua/send/ijak6","_blank");
}

function go(p){ location.href=p; }

async function logout(){
  await sb.auth.signOut();
  location.reload();
}

loadUser();
