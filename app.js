const sb = supabase.createClient(
  "https://mefzopeenhfdqfatbjaq.supabase.co",
  "sb_publishable_LU94dUJoW2jwZJ9WIdfsMw_lEnMQobx"
);

async function initIndex(){
  const { data:{ user } } = await sb.auth.getUser();
  if(!user) return;

  const { data } = await sb.from("bank")
    .select("name,idd,balance")
    .eq("user_id", user.id)
    .single();

  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("panel").classList.remove("hidden");

  document.getElementById("name").innerText = data.name;
  document.getElementById("idd").innerText = data.idd;
  document.getElementById("balance").innerText = data.balance;
}

async function login(){
  await sb.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });
  location.reload();
}

async function logout(){
  await sb.auth.signOut();
  location.reload();
}

document.addEventListener("DOMContentLoaded", initIndex);
