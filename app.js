const sb = supabase.createClient(
  "https://mefzopeenhfdqfatbjaq.supabase.co",
  "sb_publishable_LU94dUJoW2jwZJ9WIdfsMw_lEnMQobx"
);

// === AUTO LOGIN ===
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if(user){
    showUser(user);
  }
});

// === LOGIN ===
async function login(){
  const email = emailInput().value;
  const password = passInput().value;

  const { data } = await sb
    .from("bank")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single();

  if(!data){
    alert("Невірні дані");
    return;
  }

  localStorage.setItem("user", JSON.stringify(data));
  showUser(data);
}

// === SHOW USER ===
function showUser(user){
  const lb = document.getElementById("loginBox");
  const ub = document.getElementById("userBox");
  if(lb) lb.style.display = "none";
  if(ub) ub.classList.remove("hidden");

  set("name", user.name || "—");
  set("idd", user.idd);
  set("balance", user.balance);
}

// === LOGOUT ===
function logout(){
  localStorage.clear();
  location.href = "index.html";
}

// === BUY SERVICE ===
async function buy(price){
  const user = getUser();
  if(user.balance < price){
    alert("Недостатньо коштів");
    return;
  }

  const newBalance = user.balance - price;

  await sb.from("bank")
    .update({ balance: newBalance })
    .eq("idd", user.idd);

  user.balance = newBalance;
  localStorage.setItem("user", JSON.stringify(user));
  alert("Успішно!");
}

// === TRANSFER ===
async function transfer(){
  const toIdd = document.getElementById("toIdd").value;
  const sum = Number(document.getElementById("sum").value);
  const user = getUser();

  if(sum <= 0 || user.balance < sum){
    alert("Помилка суми");
    return;
  }

  const { data: target } = await sb
    .from("bank")
    .select("*")
    .eq("idd", toIdd)
    .single();

  if(!target){
    alert("Користувача не знайдено");
    return;
  }

  await sb.from("bank")
    .update({ balance: user.balance - sum })
    .eq("idd", user.idd);

  await sb.from("bank")
    .update({ balance: target.balance + sum })
    .eq("idd", toIdd);

  user.balance -= sum;
  localStorage.setItem("user", JSON.stringify(user));
  alert("Переказ успішний!");
}

// === HELPERS ===
function getUser(){
  return JSON.parse(localStorage.getItem("user"));
}
function set(id,val){
  const el=document.getElementById(id);
  if(el) el.innerText=val;
}
function go(p){location.href=p}
function back(){history.back()}
function openPrivat(){
  window.open("https://www.privat24.ua/send/ijak6","_blank")
}
function emailInput(){return document.getElementById("email")}
function passInput(){return document.getElementById("password")}
