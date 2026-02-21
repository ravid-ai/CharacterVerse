export async function onRequestGet(context) {
  try {
    // گرفتن همه کاراکترها از دیتابیس (نزولی بر اساس تاریخ ساخت)
    const { results } = await context.env.MY_DB.prepare(
      "SELECT * FROM characters ORDER BY created_at DESC"
    ).all();

    const chars = {};
    results.forEach(row => {
      // ستون data حاوی کل اطلاعات جیسون کاراکتره
      if (row.data) {
        chars[row.id] = JSON.parse(row.data);
      }
    });

    return Response.json(chars);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const { char } = await context.request.json();

    if (!char || !char.id) {
      return Response.json({ error: "Invalid character data" }, { status: 400 });
    }

    // ذخیره یا آپدیت کاراکتر در دیتابیس
    await context.env.MY_DB.prepare(
      "INSERT OR REPLACE INTO characters (id, name, data, created_at) VALUES (?, ?, ?, ?)"
    ).bind(char.id, char.name, JSON.stringify(char), char.createdAt || Date.now()).run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
