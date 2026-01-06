const sb = supabase.createClient(
  "https://mefzopeenhfdqfatbjaq.supabase.co",
  "sb_publishable_LU94dUJoW2jwZJ9WIdfsMw_lEnMQobx"
);

let currentUser = null;

// ===== AUTO LOGIN =====
document.addEventListener("DOMContentLoaded", async () => {
  const { data:{ user } } = await sb.auth.getUser();
  if(user){
    await loadBankUser(user);
  }
});

// ===== LOGIN =====
async function login(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if(error){
    alert("❌ Невірний email або пароль");
    return;
  }
  await loadBankUser(data.user);
}

// ===== LOAD / CREATE BANK USER =====
async function loadBankUser(user){
  let { data } = await sb
    .from("bank")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if(!data){
    const newIdd = Math.floor(100000 + Math.random() * 900000);
    const res = await sb.from("bank").insert({
      user_id: user.id,
      name: user.email.split("@")[0],
      idd: newIdd,
      balance: 0
    }).select().single();
    data = res.data;
  }

  currentUser = data;

  const lb=document.getElementById("loginBox");
  const ub=document.getElementById("userBox");
  if(lb) lb.style.display="none";
  if(ub) ub.classList.remove("hidden");

  set("name", data.name);
  set("idd", data.idd);
  set("balance", data.balance);
}

// ===== GET FRESH BALANCE =====
async function getFreshBalance(){
  const { data } = await sb
    .from("bank")
    .select("balance")
    .eq("user_id", currentUser.user_id)
    .single();
  return Number(data.balance);
}

// ===== BUY SERVICE =====
async function buy(price){
  const bal = await getFreshBalance();
  if(bal < price){
    alert("❌ Недостатньо коштів");
    return;
  }

  const newBal = bal - price;
  await sb.from("bank")
    .update({ balance:newBal })
    .eq("user_id", currentUser.user_id);

  currentUser.balance = newBal;
  set("balance", newBal);
  alert("✅ Куплено");
}

// ===== TRANSFER =====
async function transfer(){
  const toIdd = document.getElementById("toIdd").value;
  const sum = Number(document.getElementById("sum").value);

  if(sum <= 0){
    alert("❌ Невірна сума");
    return;
  }

  const bal = await getFreshBalance();
  if(bal < sum){
    alert("❌ Недостатньо коштів");
    return;
  }

  const { data:target } = await sb
    .from("bank")
    .select("user_id,balance")
    .eq("idd", toIdd)
    .single();

  if(!target){
    alert("❌ Отримувача не знайдено");
    return;
  }

  await sb.from("bank")
    .update({ balance: bal - sum })
    .eq("user_id", currentUser.user_id);

  await sb.from("bank")
    .update({ balance: Number(target.balance) + sum })
    .eq("user_id", target.user_id);

  currentUser.balance = bal - sum;
  set("balance", currentUser.balance);

  alert("✅ Переказ виконано");
  location.href="index.html";
}

// ===== HELPERS =====
function set(id,val){
  const el=document.getElementById(id);
  if(el) el.innerText=val;
}
function go(p){location.href=p}
function back(){history.back()}
function openPrivat(){
  window.open("https://www.privat24.ua/send/ijak6","_blank");
}
async function logout(){
  await sb.auth.signOut();
  location.reload();
}
