// =========================
// ПОСЛУГИ + ЗАПИТИ
// =========================
async function buy(serviceName, price){
  const user = JSON.parse(localStorage.getItem("user"));
  if(!user){
    alert("❌ Ви не увійшли");
    location.href = "index.html";
    return;
  }

  let finalPrice = price;

  // VIP знижка 20%
  if(user.is_vip_user === true){
    finalPrice = Math.ceil(price * 0.8);
  }

  if(user.balance < finalPrice){
    alert("❌ Недостатньо коштів");
    return;
  }

  // 1️⃣ списуємо баланс
  const newBalance = user.balance - finalPrice;

  const { error: balErr } = await sb
    .from("bank")
    .update({ balance: newBalance })
    .eq("idd", user.idd);

  if(balErr){
    alert("❌ Помилка списання");
    console.error(balErr);
    return;
  }

  // 2️⃣ ЗАПИСУЄМО ЗАПИТ
  const { error: reqErr } = await sb
    .from("service_requests")
    .insert({
      user_id: user.user_id || null,
      idd: user.idd,
      service: serviceName,
      price: finalPrice
    });

  if(reqErr){
    alert("⚠️ Баланс списано, але запит не записався");
    console.error(reqErr);
  }

  // 3️⃣ оновлюємо localStorage
  user.balance = newBalance;
  localStorage.setItem("user", JSON.stringify(user));

  alert(
    `✅ Заявка створена\n` +
    `Послуга: ${serviceName}\n` +
    `Сума: ${finalPrice}`
  );
}
