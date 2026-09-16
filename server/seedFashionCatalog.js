const db = require("./src/db");

const categories = [
  ["Men", "men"],
  ["Women", "women"],
  ["Shirts", "shirts"],
  ["T-Shirts", "t-shirts"],
  ["Pants", "pants"],
  ["Panjabi", "panjabi"],
  ["Shoes", "shoes"],
  ["Watches", "watches"],
  ["Wallets", "wallets"],
  ["Ladies Bags", "ladies-bags"],
  ["Accessories", "accessories"],
  ["Deals", "deals"],
];

const products = [
  {
    name: "Premium Casual Shirt",
    sku: "VLX-SHIRT-001",
    category: "Shirts",
    price: 1790,
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Classic Oxford Shirt",
    sku: "VLX-SHIRT-002",
    category: "Shirts",
    price: 1990,
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Essential Black T-Shirt",
    sku: "VLX-TSHIRT-001",
    category: "T-Shirts",
    price: 790,
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Oversized Premium T-Shirt",
    sku: "VLX-TSHIRT-002",
    category: "T-Shirts",
    price: 990,
    stock: 32,
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Regular Fit Chino Pants",
    sku: "VLX-PANT-001",
    category: "Pants",
    price: 1290,
    stock: 24,
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Modern Black Trousers",
    sku: "VLX-PANT-002",
    category: "Pants",
    price: 1690,
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Premium Cotton Panjabi",
    sku: "VLX-PANJABI-001",
    category: "Panjabi",
    price: 1990,
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Festive Embroidered Panjabi",
    sku: "VLX-PANJABI-002",
    category: "Panjabi",
    price: 2490,
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Urban White Sneakers",
    sku: "VLX-SHOE-001",
    category: "Shoes",
    price: 2490,
    stock: 28,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Classic Leather Loafers",
    sku: "VLX-SHOE-002",
    category: "Shoes",
    price: 3290,
    stock: 16,
    image:
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Classic Analog Watch",
    sku: "VLX-WATCH-001",
    category: "Watches",
    price: 3990,
    stock: 14,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Gold Edge Dress Watch",
    sku: "VLX-WATCH-002",
    category: "Watches",
    price: 4490,
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Leather Bi-Fold Wallet",
    sku: "VLX-WALLET-001",
    category: "Wallets",
    price: 1190,
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Elegant Ladies Handbag",
    sku: "VLX-BAG-001",
    category: "Ladies Bags",
    price: 2590,
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Structured Ladies Tote",
    sku: "VLX-BAG-002",
    category: "Ladies Bags",
    price: 2990,
    stock: 14,
    image:
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Classic Sunglasses",
    sku: "VLX-ACC-001",
    category: "Accessories",
    price: 990,
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Premium Leather Belt",
    sku: "VLX-ACC-002",
    category: "Accessories",
    price: 1190,
    stock: 25,
    image:
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Premium Women's Top",
    sku: "VLX-WOMEN-001",
    category: "Women",
    price: 1490,
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Modern Women's Dress",
    sku: "VLX-WOMEN-002",
    category: "Women",
    price: 2290,
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Men's Casual Overshirt",
    sku: "VLX-MEN-001",
    category: "Men",
    price: 1890,
    stock: 20,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
  },
];

async function getColumns(table) {
  const [rows] = await db.query(
    `
    SELECT
      COLUMN_NAME,
      IS_NULLABLE,
      COLUMN_DEFAULT,
      EXTRA
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
    ORDER BY ORDINAL_POSITION
    `,
    [table]
  );

  return rows;
}

function hasColumn(columns, name) {
  return columns.some(
    (column) =>
      column.COLUMN_NAME === name
  );
}

function requiredColumns(
  columns,
  usedColumns
) {
  return columns.filter(
    (column) =>
      column.IS_NULLABLE === "NO" &&
      column.COLUMN_DEFAULT === null &&
      !String(column.EXTRA || "").includes(
        "auto_increment"
      ) &&
      !usedColumns.includes(
        column.COLUMN_NAME
      )
  );
}

async function createCategory(
  categoryName,
  slug,
  columns
) {
  const [existing] =
    await db.query(
      `
      SELECT id
      FROM categories
      WHERE name = ?
      LIMIT 1
      `,
      [categoryName]
    );

  if (existing.length > 0) {
    return existing[0].id;
  }

  const insertColumns = [];
  const values = [];

  if (hasColumn(columns, "name")) {
    insertColumns.push("name");
    values.push(categoryName);
  }

  if (hasColumn(columns, "slug")) {
    insertColumns.push("slug");
    values.push(slug);
  }

  if (
    hasColumn(
      columns,
      "description"
    )
  ) {
    insertColumns.push(
      "description"
    );
    values.push(
      `${categoryName} collection`
    );
  }

  if (
    hasColumn(
      columns,
      "is_active"
    )
  ) {
    insertColumns.push(
      "is_active"
    );
    values.push(1);
  }

  const missing =
    requiredColumns(
      columns,
      insertColumns.concat(["id"])
    );

  if (missing.length > 0) {
    throw new Error(
      `categories table missing values for: ${missing
        .map(
          (item) =>
            item.COLUMN_NAME
        )
        .join(", ")}`
    );
  }

  const placeholders =
    insertColumns
      .map(() => "?")
      .join(", ");

  const [result] =
    await db.query(
      `
      INSERT INTO categories
      (${insertColumns.join(", ")})
      VALUES (${placeholders})
      `,
      values
    );

  return result.insertId;
}

async function createProduct(
  product,
  categoryId,
  columns
) {
  const [existing] =
    await db.query(
      `
      SELECT id
      FROM products
      WHERE sku = ?
      LIMIT 1
      `,
      [product.sku]
    );

  if (existing.length > 0) {
    console.log(
      `Already exists: ${product.name}`
    );
    return;
  }

  const data = {
    name: product.name,
    sku: product.sku,
    category_id: categoryId,
    description: `${product.name} from the Veylix fashion collection.`,
    price: product.price,
    stock_quantity: product.stock,
    low_stock_threshold: 5,
    image: product.image,
    is_active: 1,
  };

  if (
    hasColumn(
      columns,
      "cost_price"
    )
  ) {
    data.cost_price = Math.round(
      product.price * 0.55
    );
  }

  const insertColumns =
    Object.keys(data).filter(
      (column) =>
        hasColumn(
          columns,
          column
        )
    );

  const missing =
    requiredColumns(
      columns,
      insertColumns.concat(["id"])
    );

  if (missing.length > 0) {
    throw new Error(
      `products table missing values for: ${missing
        .map(
          (item) =>
            item.COLUMN_NAME
        )
        .join(", ")}`
    );
  }

  const values =
    insertColumns.map(
      (column) =>
        data[column]
    );

  const placeholders =
    insertColumns
      .map(() => "?")
      .join(", ");

  await db.query(
    `
    INSERT INTO products
    (${insertColumns.join(", ")})
    VALUES (${placeholders})
    `,
    values
  );

  console.log(
    `Added: ${product.name}`
  );
}

async function main() {
  console.log("");
  console.log(
    "================================="
  );
  console.log(
    " VEYLIX FASHION CATALOG SETUP"
  );
  console.log(
    "================================="
  );
  console.log("");

  const categoryColumns =
    await getColumns(
      "categories"
    );

  const productColumns =
    await getColumns(
      "products"
    );

  const categoryMap = {};

  for (const [
    name,
    slug,
  ] of categories) {
    const id =
      await createCategory(
        name,
        slug,
        categoryColumns
      );

    categoryMap[name] = id;

    console.log(
      `Category ready: ${name}`
    );
  }

  console.log("");

  for (const product of products) {
    const categoryId =
      categoryMap[
        product.category
      ];

    await createProduct(
      product,
      categoryId,
      productColumns
    );
  }

  console.log("");
  console.log(
    "================================="
  );
  console.log(
    " CATALOG SETUP COMPLETED"
  );
  console.log(
    "================================="
  );
  console.log(
    "Existing orders/customers/payments were not changed."
  );
  console.log("");

  await db.end();
}

main().catch(async (error) => {
  console.error("");
  console.error(
    "CATALOG SETUP FAILED"
  );
  console.error(error.message);
  console.error("");

  try {
    await db.end();
  } catch {}

  process.exit(1);
});