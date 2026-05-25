// 食物种子数据 — 基于《中国食物成分表》公开数据 + USDA 子集
// 所有数据为每 100g 可食部分，calories=kcal, protein/carbs/fat=fiber=sugar/sodium=g
// 分类：主食/肉禽/水产/蔬菜/菌菇/豆制品/水果/坚果/奶制品/蛋类/饮品/速食/调味料
// 运行: tsx prisma/seed-foods.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FoodSeed {
  name: string;
  category: string;
  nameEn?: string;
  servingUnit?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

const foods: FoodSeed[] = [
  // ========== 主食 ==========
  { name: '白米饭', category: '主食', nameEn: 'Cooked White Rice', calories: 116, protein: 2.6, carbs: 25.9, fat: 0.3, fiber: 0.3 },
  { name: '糙米饭', category: '主食', nameEn: 'Cooked Brown Rice', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
  { name: '白米粥', category: '主食', nameEn: 'Rice Congee', calories: 46, protein: 1.1, carbs: 9.7, fat: 0.1, fiber: 0.1 },
  { name: '馒头', category: '主食', nameEn: 'Steamed Bun', calories: 223, protein: 7, carbs: 44.2, fat: 1.1, fiber: 1.3 },
  { name: '花卷', category: '主食', nameEn: 'Flower Roll', calories: 211, protein: 6.4, carbs: 45.6, fat: 1.1, fiber: 1.5 },
  { name: '面条(煮)', category: '主食', nameEn: 'Cooked Noodles', calories: 110, protein: 3.9, carbs: 22.2, fat: 0.4, fiber: 0.4 },
  { name: '全麦面包', category: '主食', nameEn: 'Whole Wheat Bread', calories: 247, protein: 9.8, carbs: 41.3, fat: 3.4, fiber: 6.0 },
  { name: '白面包', category: '主食', nameEn: 'White Bread', calories: 267, protein: 8.3, carbs: 49.5, fat: 3.4, fiber: 2.3, sugar: 5.0 },
  { name: '燕麦片', category: '主食', nameEn: 'Oatmeal', calories: 367, protein: 13.5, carbs: 66.3, fat: 6.7, fiber: 10.6 },
  { name: '小米粥', category: '主食', nameEn: 'Millet Congee', calories: 46, protein: 1.4, carbs: 8.4, fat: 0.7, fiber: 0.4 },
  { name: '玉米(煮)', category: '主食', nameEn: 'Boiled Corn', calories: 112, protein: 4, carbs: 22.8, fat: 1.2, fiber: 2.9 },
  { name: '红薯(蒸)', category: '主食', nameEn: 'Steamed Sweet Potato', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3.0, sugar: 4.2 },
  { name: '土豆(煮)', category: '主食', nameEn: 'Boiled Potato', calories: 77, protein: 2.0, carbs: 17.5, fat: 0.1, fiber: 2.2 },
  { name: '饺子(猪肉)', category: '主食', nameEn: 'Pork Dumpling', calories: 218, protein: 7.6, carbs: 22.0, fat: 10.8, fiber: 0.5 },
  { name: '包子(猪肉)', category: '主食', nameEn: 'Pork Bun', calories: 227, protein: 7.3, carbs: 28.6, fat: 10.0, fiber: 0.8 },
  { name: '油条', category: '主食', nameEn: 'Fried Dough Stick', calories: 388, protein: 6.9, carbs: 51.0, fat: 17.6, fiber: 0.9 },
  { name: '粽子(肉)', category: '主食', nameEn: 'Meat Zongzi', calories: 195, protein: 6.5, carbs: 28.7, fat: 6.0, fiber: 1.0 },
  { name: '年糕', category: '主食', nameEn: 'Rice Cake', calories: 154, protein: 3.3, carbs: 34.7, fat: 0.6, fiber: 0.3 },
  { name: '凉皮', category: '主食', nameEn: 'Cold Rice Noodle', calories: 117, protein: 3.0, carbs: 24.8, fat: 0.5, fiber: 0.3 },
  { name: '糯米烧卖', category: '主食', nameEn: 'Sticky Rice Shumai', calories: 225, protein: 6.5, carbs: 32.5, fat: 7.5, fiber: 0.6 },
  { name: '春卷(炸)', category: '主食', nameEn: 'Fried Spring Roll', calories: 320, protein: 6.3, carbs: 25.8, fat: 21.5, fiber: 1.2 },

  // ========== 肉禽 ==========
  { name: '鸡胸肉(煮)', category: '肉禽', nameEn: 'Boiled Chicken Breast', calories: 133, protein: 31.0, carbs: 0, fat: 1.2, sodium: 74 },
  { name: '鸡胸肉(生)', category: '肉禽', nameEn: 'Raw Chicken Breast', calories: 120, protein: 23.1, carbs: 0, fat: 2.5, sodium: 65 },
  { name: '鸡腿肉(去皮)', category: '肉禽', nameEn: 'Chicken Thigh (Skinless)', calories: 119, protein: 20.7, carbs: 0, fat: 3.6 },
  { name: '鸡腿肉(带皮)', category: '肉禽', nameEn: 'Chicken Thigh (With Skin)', calories: 221, protein: 19.6, carbs: 0, fat: 15.8 },
  { name: '鸡翅', category: '肉禽', nameEn: 'Chicken Wing', calories: 222, protein: 18.6, carbs: 0, fat: 16.3 },
  { name: '鸡肝', category: '肉禽', nameEn: 'Chicken Liver', calories: 121, protein: 18.2, carbs: 2.0, fat: 4.8 },
  { name: '鸭肉', category: '肉禽', nameEn: 'Duck Meat', calories: 200, protein: 18.5, carbs: 0.5, fat: 14.5 },
  { name: '猪瘦肉', category: '肉禽', nameEn: 'Lean Pork', calories: 143, protein: 20.3, carbs: 1.5, fat: 6.2 },
  { name: '猪里脊', category: '肉禽', nameEn: 'Pork Loin', calories: 136, protein: 20.5, carbs: 0.7, fat: 5.3 },
  { name: '猪五花肉', category: '肉禽', nameEn: 'Pork Belly', calories: 395, protein: 9.4, carbs: 0, fat: 40.4 },
  { name: '猪排骨', category: '肉禽', nameEn: 'Pork Ribs', calories: 264, protein: 18.3, carbs: 0, fat: 20.4 },
  { name: '猪肝', category: '肉禽', nameEn: 'Pork Liver', calories: 129, protein: 19.3, carbs: 5.0, fat: 3.5 },
  { name: '猪蹄', category: '肉禽', nameEn: 'Pork Trotter', calories: 260, protein: 22.6, carbs: 0, fat: 18.8 },
  { name: '培根', category: '肉禽', nameEn: 'Bacon', calories: 541, protein: 29.5, carbs: 1.4, fat: 45.0, sodium: 1930 },
  { name: '火腿肠', category: '肉禽', nameEn: 'Ham Sausage', calories: 230, protein: 13.0, carbs: 10.5, fat: 15.0, sodium: 800 },
  { name: '香肠(猪肉)', category: '肉禽', nameEn: 'Pork Sausage', calories: 349, protein: 14.0, carbs: 8.0, fat: 28.0, sodium: 1200 },
  { name: '牛里脊', category: '肉禽', nameEn: 'Beef Tenderloin', calories: 107, protein: 22.2, carbs: 0.8, fat: 2.1 },
  { name: '牛腱子', category: '肉禽', nameEn: 'Beef Shank', calories: 128, protein: 21.8, carbs: 0.1, fat: 4.5 },
  { name: '牛腩', category: '肉禽', nameEn: 'Beef Brisket', calories: 180, protein: 18.5, carbs: 0, fat: 11.5 },
  { name: '牛排', category: '肉禽', nameEn: 'Beef Steak', calories: 187, protein: 26.0, carbs: 0, fat: 8.8 },
  { name: '牛肉干', category: '肉禽', nameEn: 'Beef Jerky', calories: 320, protein: 55.6, carbs: 8.0, fat: 8.0, sodium: 1500 },
  { name: '羊腿肉', category: '肉禽', nameEn: 'Lamb Leg', calories: 161, protein: 20.5, carbs: 0.1, fat: 8.5 },
  { name: '羊排', category: '肉禽', nameEn: 'Lamb Chops', calories: 249, protein: 17.4, carbs: 0, fat: 19.7 },
  { name: '兔肉', category: '肉禽', nameEn: 'Rabbit Meat', calories: 102, protein: 21.2, carbs: 0.2, fat: 2.2 },

  // ========== 水产 ==========
  { name: '三文鱼', category: '水产', nameEn: 'Salmon', calories: 208, protein: 20.4, carbs: 0, fat: 13.4 },
  { name: '鳕鱼', category: '水产', nameEn: 'Cod', calories: 82, protein: 18.0, carbs: 0, fat: 1.0 },
  { name: '金枪鱼', category: '水产', nameEn: 'Tuna', calories: 144, protein: 23.3, carbs: 0, fat: 4.9 },
  { name: '鲈鱼', category: '水产', nameEn: 'Sea Bass', calories: 105, protein: 18.6, carbs: 0, fat: 3.4 },
  { name: '带鱼', category: '水产', nameEn: 'Hairtail', calories: 127, protein: 17.7, carbs: 0, fat: 5.5 },
  { name: '草鱼', category: '水产', nameEn: 'Grass Carp', calories: 113, protein: 16.6, carbs: 0, fat: 5.2 },
  { name: '鲫鱼', category: '水产', nameEn: 'Crucian Carp', calories: 108, protein: 17.1, carbs: 3.8, fat: 2.7 },
  { name: '虾仁', category: '水产', nameEn: 'Peeled Shrimp', calories: 78, protein: 18.6, carbs: 0.2, fat: 0.8 },
  { name: '基围虾', category: '水产', nameEn: 'White Shrimp', calories: 99, protein: 20.3, carbs: 0.6, fat: 1.7 },
  { name: '龙虾', category: '水产', nameEn: 'Lobster', calories: 90, protein: 18.8, carbs: 0.5, fat: 1.3 },
  { name: '蟹肉', category: '水产', nameEn: 'Crab Meat', calories: 83, protein: 17.5, carbs: 0.5, fat: 1.2 },
  { name: '鲍鱼', category: '水产', nameEn: 'Abalone', calories: 105, protein: 17.1, carbs: 6.0, fat: 0.8 },
  { name: '扇贝', category: '水产', nameEn: 'Scallop', calories: 77, protein: 16.8, carbs: 2.0, fat: 0.6 },
  { name: '生蚝', category: '水产', nameEn: 'Oyster', calories: 73, protein: 7.1, carbs: 7.3, fat: 2.3 },
  { name: '蛤蜊', category: '水产', nameEn: 'Clam', calories: 87, protein: 12.8, carbs: 5.0, fat: 1.0 },
  { name: '海参', category: '水产', nameEn: 'Sea Cucumber', calories: 56, protein: 12.8, carbs: 0.9, fat: 0.3 },

  // ========== 蔬菜 ==========
  { name: '西兰花', category: '蔬菜', nameEn: 'Broccoli', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6 },
  { name: '菠菜', category: '蔬菜', nameEn: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { name: '生菜', category: '蔬菜', nameEn: 'Lettuce', calories: 15, protein: 1.4, carbs: 2.1, fat: 0.2, fiber: 1.3 },
  { name: '大白菜', category: '蔬菜', nameEn: 'Napa Cabbage', calories: 13, protein: 1.5, carbs: 2.2, fat: 0.1, fiber: 1.0 },
  { name: '小白菜', category: '蔬菜', nameEn: 'Bok Choy', calories: 13, protein: 1.5, carbs: 2.2, fat: 0.1, fiber: 1.0 },
  { name: '包菜', category: '蔬菜', nameEn: 'Cabbage', calories: 25, protein: 1.5, carbs: 5.0, fat: 0.1, fiber: 2.5 },
  { name: '空心菜', category: '蔬菜', nameEn: 'Water Spinach', calories: 23, protein: 2.2, carbs: 3.6, fat: 0.3, fiber: 2.0 },
  { name: '韭菜', category: '蔬菜', nameEn: 'Chinese Chives', calories: 26, protein: 2.4, carbs: 3.5, fat: 0.4, fiber: 2.0 },
  { name: '芹菜', category: '蔬菜', nameEn: 'Celery', calories: 16, protein: 0.8, carbs: 3.3, fat: 0.1, fiber: 1.6 },
  { name: '黄瓜', category: '蔬菜', nameEn: 'Cucumber', calories: 16, protein: 0.7, carbs: 2.9, fat: 0.1, fiber: 0.5 },
  { name: '番茄', category: '蔬菜', nameEn: 'Tomato', calories: 20, protein: 0.9, carbs: 4.0, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  { name: '胡萝卜', category: '蔬菜', nameEn: 'Carrot', calories: 41, protein: 0.6, carbs: 10.0, fat: 0.2, fiber: 2.8, sugar: 4.7 },
  { name: '白萝卜', category: '蔬菜', nameEn: 'White Radish', calories: 16, protein: 0.9, carbs: 3.0, fat: 0.1 },
  { name: '芦笋', category: '蔬菜', nameEn: 'Asparagus', calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1 },
  { name: '青椒', category: '蔬菜', nameEn: 'Green Pepper', calories: 22, protein: 1.0, carbs: 4.6, fat: 0.2, fiber: 1.8 },
  { name: '红椒', category: '蔬菜', nameEn: 'Red Pepper', calories: 31, protein: 1.0, carbs: 6.0, fat: 0.3, fiber: 2.1, sugar: 4.2 },
  { name: '茄子', category: '蔬菜', nameEn: 'Eggplant', calories: 25, protein: 1.0, carbs: 5.5, fat: 0.2, fiber: 3.0 },
  { name: '豆角', category: '蔬菜', nameEn: 'Green Beans', calories: 33, protein: 2.3, carbs: 5.9, fat: 0.2, fiber: 2.7 },
  { name: '豆芽', category: '蔬菜', nameEn: 'Bean Sprouts', calories: 23, protein: 2.9, carbs: 3.1, fat: 0.1, fiber: 1.0 },
  { name: '洋葱', category: '蔬菜', nameEn: 'Onion', calories: 39, protein: 1.1, carbs: 9.0, fat: 0.1, fiber: 1.7, sugar: 4.2 },
  { name: '蒜', category: '蔬菜', nameEn: 'Garlic', calories: 126, protein: 4.5, carbs: 28.0, fat: 0.2, fiber: 1.0 },
  { name: '姜', category: '蔬菜', nameEn: 'Ginger', calories: 41, protein: 1.2, carbs: 9.8, fat: 0.7, fiber: 2.0 },
  { name: '香菜', category: '蔬菜', nameEn: 'Cilantro', calories: 23, protein: 2.2, carbs: 3.8, fat: 0.5, fiber: 2.8 },
  { name: '葱', category: '蔬菜', nameEn: 'Green Onion', calories: 30, protein: 2.5, carbs: 5.2, fat: 0.3, fiber: 2.3 },
  { name: '玉米粒', category: '蔬菜', nameEn: 'Corn Kernel', calories: 86, protein: 3.3, carbs: 18.0, fat: 1.0, fiber: 2.0 },
  { name: '豌豆', category: '蔬菜', nameEn: 'Peas', calories: 81, protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.5 },
  { name: '毛豆(煮)', category: '蔬菜', nameEn: 'Boiled Edamame', calories: 131, protein: 11.6, carbs: 10.8, fat: 5.3, fiber: 5.2 },
  { name: '秋葵', category: '蔬菜', nameEn: 'Okra', calories: 31, protein: 2.0, carbs: 7.0, fat: 0.1, fiber: 3.2 },
  { name: '藕', category: '蔬菜', nameEn: 'Lotus Root', calories: 73, protein: 2.6, carbs: 17.2, fat: 0.1, fiber: 4.9 },
  { name: '山药', category: '蔬菜', nameEn: 'Chinese Yam', calories: 56, protein: 1.9, carbs: 12.4, fat: 0.2, fiber: 0.8 },
  { name: '芋头', category: '蔬菜', nameEn: 'Taro', calories: 81, protein: 2.2, carbs: 18.1, fat: 0.2, fiber: 4.1 },
  { name: '南瓜', category: '蔬菜', nameEn: 'Pumpkin', calories: 26, protein: 0.7, carbs: 6.5, fat: 0.1, fiber: 0.5 },
  { name: '荷兰豆', category: '蔬菜', nameEn: 'Snow Peas', calories: 42, protein: 2.8, carbs: 7.0, fat: 0.3, fiber: 2.6 },
  { name: '花菜', category: '蔬菜', nameEn: 'Cauliflower', calories: 25, protein: 2.0, carbs: 5.0, fat: 0.1, fiber: 2.0 },
  { name: '四季豆', category: '蔬菜', nameEn: 'Kidney Beans', calories: 31, protein: 1.9, carbs: 6.1, fat: 0.2, fiber: 2.0 },
  { name: '油麦菜', category: '蔬菜', nameEn: 'Romaine Lettuce', calories: 17, protein: 1.5, carbs: 2.5, fat: 0.3, fiber: 2.1 },
  { name: '西芹', category: '蔬菜', nameEn: 'Celery Stalk', calories: 14, protein: 0.7, carbs: 3.0, fat: 0.2, fiber: 1.6 },

  // ========== 菌菇 ==========
  { name: '香菇', category: '菌菇', nameEn: 'Shiitake Mushroom', calories: 26, protein: 2.0, carbs: 5.3, fat: 0.1, fiber: 2.5 },
  { name: '金针菇', category: '菌菇', nameEn: 'Enoki Mushroom', calories: 22, protein: 2.7, carbs: 3.8, fat: 0.2, fiber: 2.7 },
  { name: '杏鲍菇', category: '菌菇', nameEn: 'King Oyster Mushroom', calories: 26, protein: 1.8, carbs: 5.5, fat: 0.1 },
  { name: '木耳(泡发)', category: '菌菇', nameEn: 'Wood Ear (Soaked)', calories: 21, protein: 1.5, carbs: 3.8, fat: 0.2, fiber: 2.6 },
  { name: '茶树菇', category: '菌菇', nameEn: 'Tea Tree Mushroom', calories: 22, protein: 2.3, carbs: 3.8, fat: 0.1 },

  // ========== 豆制品 ==========
  { name: '豆腐', category: '豆制品', nameEn: 'Tofu', calories: 76, protein: 8.1, carbs: 2.0, fat: 3.7, fiber: 0.3 },
  { name: '嫩豆腐', category: '豆制品', nameEn: 'Silken Tofu', calories: 55, protein: 5.3, carbs: 2.4, fat: 2.5 },
  { name: '冻豆腐', category: '豆制品', nameEn: 'Frozen Tofu', calories: 73, protein: 8.2, carbs: 2.0, fat: 3.5 },
  { name: '豆腐皮', category: '豆制品', nameEn: 'Tofu Skin', calories: 409, protein: 44.6, carbs: 18.8, fat: 17.4 },
  { name: '腐竹', category: '豆制品', nameEn: 'Dried Tofu Stick', calories: 459, protein: 44.6, carbs: 22.4, fat: 21.8 },
  { name: '豆腐干', category: '豆制品', nameEn: 'Dried Tofu', calories: 140, protein: 16.2, carbs: 3.2, fat: 7.2 },
  { name: '豆浆', category: '豆制品', nameEn: 'Soy Milk', calories: 33, protein: 2.8, carbs: 1.8, fat: 1.6 },

  // ========== 水果 ==========
  { name: '苹果', category: '水果', nameEn: 'Apple', calories: 53, protein: 0.2, carbs: 13.4, fat: 0.2, fiber: 2.4, sugar: 10.0 },
  { name: '香蕉', category: '水果', nameEn: 'Banana', calories: 93, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2 },
  { name: '橙子', category: '水果', nameEn: 'Orange', calories: 48, protein: 1.0, carbs: 11.1, fat: 0.1, fiber: 2.4, sugar: 9.4 },
  { name: '葡萄', category: '水果', nameEn: 'Grapes', calories: 69, protein: 0.7, carbs: 18.1, fat: 0.2, fiber: 0.9, sugar: 15.5 },
  { name: '西瓜', category: '水果', nameEn: 'Watermelon', calories: 31, protein: 0.6, carbs: 7.6, fat: 0.1, fiber: 0.4, sugar: 6.2 },
  { name: '草莓', category: '水果', nameEn: 'Strawberry', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0, sugar: 4.9 },
  { name: '蓝莓', category: '水果', nameEn: 'Blueberry', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10.0 },
  { name: '猕猴桃', category: '水果', nameEn: 'Kiwi', calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5, fiber: 3.0, sugar: 9.0 },
  { name: '芒果', category: '水果', nameEn: 'Mango', calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 1.6, sugar: 13.7 },
  { name: '火龙果', category: '水果', nameEn: 'Dragon Fruit', calories: 55, protein: 1.1, carbs: 13.0, fat: 0.4, fiber: 1.8, sugar: 8.0 },
  { name: '菠萝', category: '水果', nameEn: 'Pineapple', calories: 44, protein: 0.5, carbs: 10.8, fat: 0.1, fiber: 1.4, sugar: 9.9 },
  { name: '牛油果', category: '水果', nameEn: 'Avocado', calories: 161, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7 },
  { name: '梨', category: '水果', nameEn: 'Pear', calories: 51, protein: 0.4, carbs: 13.1, fat: 0.1, fiber: 3.1, sugar: 9.8 },
  { name: '木瓜', category: '水果', nameEn: 'Papaya', calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3, fiber: 1.7, sugar: 7.8 },
  { name: '荔枝', category: '水果', nameEn: 'Lychee', calories: 66, protein: 0.8, carbs: 16.5, fat: 0.4, fiber: 1.3, sugar: 15.2 },
  { name: '桃子', category: '水果', nameEn: 'Peach', calories: 42, protein: 0.9, carbs: 10.2, fat: 0.1, fiber: 1.5, sugar: 8.4 },
  { name: '樱花', category: '水果', nameEn: 'Cherry', calories: 50, protein: 1.0, carbs: 12.2, fat: 0.3, fiber: 1.6, sugar: 8.5 },
  { name: '柚子', category: '水果', nameEn: 'Pomelo', calories: 42, protein: 0.7, carbs: 9.1, fat: 0.2, fiber: 1.0, sugar: 6.0 },
  { name: '柠檬', category: '水果', nameEn: 'Lemon', calories: 37, protein: 0.7, carbs: 8.9, fat: 0.3, fiber: 2.8, sugar: 2.5 },

  // ========== 坚果 ==========
  { name: '核桃', category: '坚果', nameEn: 'Walnut', calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7 },
  { name: '杏仁', category: '坚果', nameEn: 'Almond', calories: 579, protein: 21.2, carbs: 21.7, fat: 49.9, fiber: 12.5 },
  { name: '腰果', category: '坚果', nameEn: 'Cashew', calories: 553, protein: 18.2, carbs: 30.2, fat: 43.8, fiber: 3.3 },
  { name: '开心果', category: '坚果', nameEn: 'Pistachio', calories: 560, protein: 20.2, carbs: 27.2, fat: 45.3, fiber: 10.6 },
  { name: '花生', category: '坚果', nameEn: 'Peanut', calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5 },
  { name: '花生酱', category: '坚果', nameEn: 'Peanut Butter', calories: 590, protein: 25.0, carbs: 20.0, fat: 50.0, fiber: 6.0, sugar: 9.0 },
  { name: '葵花籽', category: '坚果', nameEn: 'Sunflower Seed', calories: 582, protein: 19.3, carbs: 20.0, fat: 49.8, fiber: 8.6 },
  { name: '南瓜籽', category: '坚果', nameEn: 'Pumpkin Seed', calories: 559, protein: 30.2, carbs: 10.7, fat: 49.0, fiber: 6.0 },
  { name: '奇亚籽', category: '坚果', nameEn: 'Chia Seed', calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4 },
  { name: '芝麻', category: '坚果', nameEn: 'Sesame Seed', calories: 573, protein: 17.7, carbs: 23.4, fat: 49.7, fiber: 11.8 },

  // ========== 奶制品 ==========
  { name: '全脂牛奶', category: '奶制品', nameEn: 'Whole Milk', calories: 61, protein: 3.0, carbs: 5.0, fat: 3.2, sugar: 5.0, sodium: 44 },
  { name: '脱脂牛奶', category: '奶制品', nameEn: 'Skim Milk', calories: 34, protein: 3.4, carbs: 4.9, fat: 0.1, sugar: 4.9, sodium: 42 },
  { name: '酸奶(原味)', category: '奶制品', nameEn: 'Plain Yogurt', calories: 70, protein: 3.3, carbs: 9.3, fat: 1.5, sugar: 9.3 },
  { name: '希腊酸奶', category: '奶制品', nameEn: 'Greek Yogurt', calories: 97, protein: 9.0, carbs: 4.0, fat: 5.0, sugar: 3.6 },
  { name: '奶酪', category: '奶制品', nameEn: 'Cheese', calories: 350, protein: 24.9, carbs: 1.3, fat: 28.7, sodium: 600 },
  { name: '马苏里拉奶酪', category: '奶制品', nameEn: 'Mozzarella', calories: 300, protein: 22.2, carbs: 2.2, fat: 22.1, sodium: 619 },
  { name: '黄油', category: '奶制品', nameEn: 'Butter', calories: 717, protein: 0.9, carbs: 0.1, fat: 81.1, sodium: 11 },

  // ========== 蛋类 ==========
  { name: '鸡蛋', category: '蛋类', nameEn: 'Chicken Egg', calories: 144, protein: 13.3, carbs: 1.5, fat: 9.5, sodium: 131 },
  { name: '鸡蛋清', category: '蛋类', nameEn: 'Egg White', calories: 48, protein: 11.1, carbs: 0.5, fat: 0.1, sodium: 170 },
  { name: '鸡蛋黄', category: '蛋类', nameEn: 'Egg Yolk', calories: 328, protein: 15.2, carbs: 1.5, fat: 28.2, sodium: 48 },
  { name: '鹌鹑蛋', category: '蛋类', nameEn: 'Quail Egg', calories: 160, protein: 12.8, carbs: 2.1, fat: 11.1 },

  // ========== 饮品 ==========
  { name: '美式咖啡(黑)', category: '饮品', nameEn: 'Americano (Black)', calories: 2, protein: 0.1, carbs: 0, fat: 0 },
  { name: '拿铁(全脂奶)', category: '饮品', nameEn: 'Latte (Whole Milk)', calories: 55, protein: 2.8, carbs: 4.5, fat: 3.0, sodium: 40 },
  { name: '可口可乐', category: '饮品', nameEn: 'Coca-Cola', calories: 42, protein: 0, carbs: 10.6, fat: 0, sugar: 10.6 },
  { name: '零度可乐', category: '饮品', nameEn: 'Coke Zero', calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: '雪碧', category: '饮品', nameEn: 'Sprite', calories: 41, protein: 0, carbs: 10.2, fat: 0, sugar: 10.2 },
  { name: '橙汁', category: '饮品', nameEn: 'Orange Juice', calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, sugar: 8.4 },
  { name: '椰子水', category: '饮品', nameEn: 'Coconut Water', calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, sugar: 2.6 },
  { name: '运动饮料', category: '饮品', nameEn: 'Sports Drink', calories: 27, protein: 0, carbs: 6.7, fat: 0, sugar: 6.7, sodium: 42 },
  { name: '啤酒', category: '饮品', nameEn: 'Beer', calories: 43, protein: 0.5, carbs: 3.6, fat: 0 },
  { name: '红酒', category: '饮品', nameEn: 'Red Wine', calories: 85, protein: 0.1, carbs: 2.6, fat: 0, sugar: 0.6 },
  { name: '绿茶(无糖)', category: '饮品', nameEn: 'Green Tea', calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: '红茶(无糖)', category: '饮品', nameEn: 'Black Tea', calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: '珍珠奶茶', category: '饮品', nameEn: 'Bubble Milk Tea', calories: 78, protein: 0.5, carbs: 15.5, fat: 1.5, sugar: 12.0 },
  { name: '蛋白粉(乳清)', category: '饮品', nameEn: 'Whey Protein', calories: 380, protein: 80.0, carbs: 8.0, fat: 3.0 },

  // ========== 速食/零食 ==========
  { name: '方便面(泡)', category: '速食', nameEn: 'Instant Noodles', calories: 440, protein: 9.0, carbs: 59.0, fat: 18.0, sodium: 1800 },
  { name: '汉堡(牛肉)', category: '速食', nameEn: 'Beef Burger', calories: 295, protein: 17.2, carbs: 29.2, fat: 12.2, sodium: 414 },
  { name: '薯条', category: '速食', nameEn: 'French Fries', calories: 312, protein: 3.4, carbs: 41.4, fat: 14.7, fiber: 3.8 },
  { name: '披萨', category: '速食', nameEn: 'Pizza', calories: 266, protein: 11.4, carbs: 33.0, fat: 10.0 },
  { name: '三明治(鸡肉)', category: '速食', nameEn: 'Chicken Sandwich', calories: 234, protein: 15.5, carbs: 28.5, fat: 6.5 },
  { name: '寿司(三文鱼)', category: '速食', nameEn: 'Salmon Sushi', calories: 140, protein: 7.0, carbs: 28.0, fat: 1.0 },
  { name: '黑巧克力', category: '速食', nameEn: 'Dark Chocolate', calories: 546, protein: 4.9, carbs: 45.9, fat: 42.6, fiber: 10.9, sugar: 24.0 },
  { name: '薯片', category: '速食', nameEn: 'Potato Chips', calories: 536, protein: 5.7, carbs: 49.7, fat: 34.6, sodium: 560 },
  { name: '饼干', category: '速食', nameEn: 'Plain Biscuit', calories: 433, protein: 8.0, carbs: 70.0, fat: 14.0, sugar: 20.0 },
  { name: '冰淇淋', category: '速食', nameEn: 'Ice Cream', calories: 207, protein: 3.5, carbs: 23.6, fat: 11.0, sugar: 21.2 },

  // ========== 调味料 ==========
  { name: '生抽', category: '调味料', nameEn: 'Light Soy Sauce', calories: 53, protein: 5.6, carbs: 5.0, fat: 0.4, sodium: 5600 },
  { name: '蚝油', category: '调味料', nameEn: 'Oyster Sauce', calories: 140, protein: 3.8, carbs: 28.0, fat: 1.0, sodium: 3800 },
  { name: '醋', category: '调味料', nameEn: 'Vinegar', calories: 18, protein: 0.1, carbs: 1.0, fat: 0, sodium: 8 },
  { name: '豆瓣酱', category: '调味料', nameEn: 'Bean Paste', calories: 150, protein: 10.0, carbs: 18.0, fat: 5.5, sodium: 6000 },
  { name: '番茄酱', category: '调味料', nameEn: 'Tomato Sauce', calories: 110, protein: 1.0, carbs: 27.0, fat: 0.1, sugar: 22.0, sodium: 900 },
  { name: '沙拉酱', category: '调味料', nameEn: 'Mayonnaise', calories: 680, protein: 0.9, carbs: 1.0, fat: 75.0, sodium: 500 },
  { name: '橄榄油', category: '调味料', nameEn: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100.0 },
  { name: '花生油', category: '调味料', nameEn: 'Peanut Oil', calories: 884, protein: 0, carbs: 0, fat: 100.0 },
  { name: '芝麻油', category: '调味料', nameEn: 'Sesame Oil', calories: 884, protein: 0, carbs: 0, fat: 100.0 },
  { name: '白砂糖', category: '调味料', nameEn: 'White Sugar', calories: 400, protein: 0, carbs: 100.0, fat: 0, sugar: 100.0 },
  { name: '蜂蜜', category: '调味料', nameEn: 'Honey', calories: 304, protein: 0.3, carbs: 82.4, fat: 0, sugar: 82.1 },
  { name: '盐', category: '调味料', nameEn: 'Salt', calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 38758 },
  { name: '辣椒酱', category: '调味料', nameEn: 'Chili Sauce', calories: 80, protein: 1.8, carbs: 14.0, fat: 2.5, sodium: 3500 },

  // ============================================================
  // 扩展：中式主食与小吃
  // ============================================================
  { name: '小笼包(猪肉)', category: '主食', nameEn: 'Xiaolongbao', calories: 238, protein: 8.5, carbs: 26.0, fat: 11.0, fiber: 0.8 },
  { name: '锅贴', category: '主食', nameEn: 'Pan-fried Dumpling', calories: 245, protein: 8.0, carbs: 25.0, fat: 12.5, fiber: 0.7 },
  { name: '烧饼', category: '主食', nameEn: 'Sesame Pancake', calories: 326, protein: 8.0, carbs: 53.0, fat: 9.5, fiber: 1.5 },
  { name: '葱油饼', category: '主食', nameEn: 'Scallion Pancake', calories: 359, protein: 6.5, carbs: 45.0, fat: 17.5, fiber: 1.2 },
  { name: '煎饼果子', category: '主食', nameEn: 'Jianbing', calories: 252, protein: 9.5, carbs: 32.0, fat: 9.8, fiber: 1.5 },
  { name: '生煎包', category: '主食', nameEn: 'Pan-fried Bun', calories: 270, protein: 7.5, carbs: 30.0, fat: 13.0, fiber: 0.6 },
  { name: '肉夹馍', category: '主食', nameEn: 'Rou Jia Mo', calories: 296, protein: 13.5, carbs: 36.0, fat: 11.0, fiber: 1.5 },
  { name: '牛肉面', category: '主食', nameEn: 'Beef Noodle Soup', calories: 145, protein: 7.0, carbs: 20.0, fat: 4.0, fiber: 0.8, sodium: 1100 },
  { name: '炸酱面', category: '主食', nameEn: 'Zhajiangmian', calories: 198, protein: 8.0, carbs: 26.0, fat: 7.0, fiber: 1.2 },
  { name: '兰州拉面', category: '主食', nameEn: 'Lanzhou Beef Noodle', calories: 132, protein: 6.5, carbs: 18.5, fat: 3.8, sodium: 950 },
  { name: '热干面', category: '主食', nameEn: 'Hot Dry Noodles', calories: 220, protein: 7.0, carbs: 35.0, fat: 6.0 },
  { name: '米线', category: '主食', nameEn: 'Rice Vermicelli', calories: 109, protein: 1.8, carbs: 24.5, fat: 0.2 },
  { name: '河粉', category: '主食', nameEn: 'Wide Rice Noodle', calories: 112, protein: 1.9, carbs: 25.0, fat: 0.3 },
  { name: '乌冬面', category: '主食', nameEn: 'Udon', calories: 127, protein: 3.5, carbs: 26.0, fat: 0.6 },
  { name: '荞麦面', category: '主食', nameEn: 'Soba', calories: 99, protein: 5.1, carbs: 20.0, fat: 0.4, fiber: 1.5 },
  { name: '意大利面(煮)', category: '主食', nameEn: 'Cooked Pasta', calories: 131, protein: 5.0, carbs: 25.0, fat: 1.1, fiber: 1.8 },
  { name: '法棍面包', category: '主食', nameEn: 'Baguette', calories: 274, protein: 9.0, carbs: 54.0, fat: 1.5, fiber: 2.3, sodium: 600 },
  { name: '吐司', category: '主食', nameEn: 'Toast', calories: 281, protein: 9.0, carbs: 51.0, fat: 4.2, fiber: 2.5, sugar: 5.0 },
  { name: '可颂', category: '主食', nameEn: 'Croissant', calories: 406, protein: 8.2, carbs: 45.8, fat: 21.0, fiber: 2.6, sugar: 11.3 },
  { name: '贝果', category: '主食', nameEn: 'Bagel', calories: 257, protein: 10.0, carbs: 50.5, fat: 1.5, fiber: 2.1 },
  { name: '玉米片', category: '主食', nameEn: 'Cornflakes', calories: 357, protein: 7.5, carbs: 84.0, fat: 0.4, fiber: 3.3, sugar: 8.0 },
  { name: '即食燕麦', category: '主食', nameEn: 'Instant Oatmeal', calories: 354, protein: 11.0, carbs: 65.0, fat: 6.5, fiber: 10.0 },
  { name: '麦片(混合)', category: '主食', nameEn: 'Mixed Granola', calories: 432, protein: 9.5, carbs: 64.0, fat: 16.0, fiber: 7.5, sugar: 21.0 },
  { name: '糯米饭', category: '主食', nameEn: 'Glutinous Rice', calories: 116, protein: 2.0, carbs: 25.6, fat: 0.2 },
  { name: '黑米饭', category: '主食', nameEn: 'Black Rice', calories: 120, protein: 3.0, carbs: 25.0, fat: 1.0, fiber: 2.0 },
  { name: '荞麦', category: '主食', nameEn: 'Buckwheat', calories: 343, protein: 13.3, carbs: 71.5, fat: 3.4, fiber: 10.0 },
  { name: '藜麦(煮)', category: '主食', nameEn: 'Cooked Quinoa', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8 },
  { name: '紫薯', category: '主食', nameEn: 'Purple Sweet Potato', calories: 99, protein: 1.5, carbs: 23.0, fat: 0.1, fiber: 2.8 },
  { name: '南瓜饼', category: '主食', nameEn: 'Pumpkin Pancake', calories: 235, protein: 4.2, carbs: 40.0, fat: 7.0, fiber: 1.8, sugar: 12.0 },

  // ============================================================
  // 扩展：肉类
  // ============================================================
  { name: '鸡胸肉(烤)', category: '肉禽', nameEn: 'Roasted Chicken Breast', calories: 165, protein: 31.0, carbs: 0, fat: 3.6 },
  { name: '鸡胸肉(煎)', category: '肉禽', nameEn: 'Pan-fried Chicken Breast', calories: 187, protein: 28.5, carbs: 0, fat: 7.5 },
  { name: '鸡心', category: '肉禽', nameEn: 'Chicken Heart', calories: 172, protein: 15.6, carbs: 0.7, fat: 11.5 },
  { name: '鸡胗', category: '肉禽', nameEn: 'Chicken Gizzard', calories: 118, protein: 19.2, carbs: 0, fat: 2.8 },
  { name: '鸭胸肉', category: '肉禽', nameEn: 'Duck Breast', calories: 132, protein: 19.9, carbs: 0, fat: 5.9 },
  { name: '北京烤鸭', category: '肉禽', nameEn: 'Peking Duck', calories: 337, protein: 16.6, carbs: 1.0, fat: 30.0 },
  { name: '鹅肉', category: '肉禽', nameEn: 'Goose', calories: 251, protein: 17.6, carbs: 0, fat: 19.9 },
  { name: '猪肉末', category: '肉禽', nameEn: 'Ground Pork', calories: 263, protein: 17.5, carbs: 0, fat: 21.2 },
  { name: '猪后腿肉', category: '肉禽', nameEn: 'Pork Rear Leg', calories: 190, protein: 21.0, carbs: 0, fat: 11.5 },
  { name: '猪腰', category: '肉禽', nameEn: 'Pork Kidney', calories: 96, protein: 15.4, carbs: 1.4, fat: 3.2 },
  { name: '猪心', category: '肉禽', nameEn: 'Pork Heart', calories: 119, protein: 16.6, carbs: 1.1, fat: 5.3 },
  { name: '叉烧肉', category: '肉禽', nameEn: 'Char Siu', calories: 278, protein: 22.0, carbs: 12.0, fat: 16.0, sodium: 900 },
  { name: '腊肠', category: '肉禽', nameEn: 'Chinese Sausage', calories: 433, protein: 22.0, carbs: 5.0, fat: 37.0, sodium: 1800 },
  { name: '咸肉', category: '肉禽', nameEn: 'Cured Pork', calories: 481, protein: 16.5, carbs: 0, fat: 46.0, sodium: 2700 },
  { name: '红烧肉', category: '肉禽', nameEn: 'Red-braised Pork', calories: 415, protein: 9.5, carbs: 5.0, fat: 41.0 },
  { name: '牛肉末', category: '肉禽', nameEn: 'Ground Beef', calories: 250, protein: 26.0, carbs: 0, fat: 17.0 },
  { name: '雪花牛肉', category: '肉禽', nameEn: 'Marbled Beef', calories: 332, protein: 17.0, carbs: 0, fat: 29.5 },
  { name: '澳洲西冷', category: '肉禽', nameEn: 'Sirloin Steak', calories: 207, protein: 24.0, carbs: 0, fat: 12.0 },
  { name: '眼肉牛排', category: '肉禽', nameEn: 'Ribeye Steak', calories: 291, protein: 24.0, carbs: 0, fat: 22.0 },
  { name: '羊肉串', category: '肉禽', nameEn: 'Lamb Skewer', calories: 240, protein: 18.0, carbs: 1.0, fat: 18.0, sodium: 650 },
  { name: '羊肉卷', category: '肉禽', nameEn: 'Lamb Roll', calories: 215, protein: 17.5, carbs: 0, fat: 15.8 },

  // ============================================================
  // 扩展：水产
  // ============================================================
  { name: '鲈鱼(蒸)', category: '水产', nameEn: 'Steamed Sea Bass', calories: 124, protein: 19.5, carbs: 0, fat: 4.5 },
  { name: '黄花鱼', category: '水产', nameEn: 'Yellow Croaker', calories: 99, protein: 17.7, carbs: 0.8, fat: 2.5 },
  { name: '鲳鱼', category: '水产', nameEn: 'Pomfret', calories: 142, protein: 18.5, carbs: 0, fat: 7.3 },
  { name: '比目鱼', category: '水产', nameEn: 'Flounder', calories: 87, protein: 17.0, carbs: 0, fat: 1.7 },
  { name: '鲷鱼', category: '水产', nameEn: 'Sea Bream', calories: 120, protein: 21.0, carbs: 0, fat: 3.7 },
  { name: '罗非鱼', category: '水产', nameEn: 'Tilapia', calories: 96, protein: 20.1, carbs: 0, fat: 1.7 },
  { name: '鳕鱼柳', category: '水产', nameEn: 'Cod Fillet', calories: 90, protein: 19.8, carbs: 0, fat: 0.8 },
  { name: '鳗鱼', category: '水产', nameEn: 'Eel', calories: 184, protein: 18.4, carbs: 0, fat: 11.7 },
  { name: '秋刀鱼', category: '水产', nameEn: 'Saury', calories: 287, protein: 18.5, carbs: 0, fat: 24.6 },
  { name: '沙丁鱼', category: '水产', nameEn: 'Sardine', calories: 208, protein: 24.6, carbs: 0, fat: 11.5 },
  { name: '金枪鱼罐头(水)', category: '水产', nameEn: 'Canned Tuna in Water', calories: 116, protein: 25.5, carbs: 0, fat: 0.8, sodium: 247 },
  { name: '鱿鱼', category: '水产', nameEn: 'Squid', calories: 84, protein: 17.0, carbs: 1.5, fat: 1.4 },
  { name: '章鱼', category: '水产', nameEn: 'Octopus', calories: 82, protein: 16.4, carbs: 2.2, fat: 1.0 },
  { name: '墨鱼', category: '水产', nameEn: 'Cuttlefish', calories: 84, protein: 16.5, carbs: 0.5, fat: 1.5 },
  { name: '虾(整只)', category: '水产', nameEn: 'Whole Shrimp', calories: 87, protein: 18.3, carbs: 0.2, fat: 1.2 },
  { name: '皮皮虾', category: '水产', nameEn: 'Mantis Shrimp', calories: 89, protein: 17.5, carbs: 0.8, fat: 1.7 },
  { name: '青口贝', category: '水产', nameEn: 'Mussel', calories: 86, protein: 11.9, carbs: 3.7, fat: 2.2 },
  { name: '海带', category: '水产', nameEn: 'Kelp', calories: 43, protein: 1.7, carbs: 9.6, fat: 0.6, fiber: 1.3, sodium: 246 },
  { name: '紫菜', category: '水产', nameEn: 'Nori', calories: 207, protein: 26.7, carbs: 44.1, fat: 1.1, fiber: 21.6, sodium: 710 },
  { name: '裙带菜', category: '水产', nameEn: 'Wakame', calories: 45, protein: 3.0, carbs: 9.1, fat: 0.6, fiber: 0.5, sodium: 872 },

  // ============================================================
  // 扩展：蔬菜
  // ============================================================
  { name: '紫甘蓝', category: '蔬菜', nameEn: 'Red Cabbage', calories: 31, protein: 1.4, carbs: 7.4, fat: 0.2, fiber: 2.1, sugar: 3.8 },
  { name: '紫薯叶', category: '蔬菜', nameEn: 'Sweet Potato Leaves', calories: 35, protein: 2.3, carbs: 6.4, fat: 0.5, fiber: 2.0 },
  { name: '苦瓜', category: '蔬菜', nameEn: 'Bitter Melon', calories: 19, protein: 1.0, carbs: 4.3, fat: 0.2, fiber: 2.0 },
  { name: '丝瓜', category: '蔬菜', nameEn: 'Loofah', calories: 20, protein: 1.0, carbs: 4.2, fat: 0.2, fiber: 0.6 },
  { name: '冬瓜', category: '蔬菜', nameEn: 'Winter Melon', calories: 13, protein: 0.4, carbs: 3.0, fat: 0.0, fiber: 0.7 },
  { name: '西葫芦', category: '蔬菜', nameEn: 'Zucchini', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1.0 },
  { name: '芹菜茎', category: '蔬菜', nameEn: 'Celery Stalk', calories: 14, protein: 0.7, carbs: 3.0, fat: 0.2, fiber: 1.6 },
  { name: '生菜叶', category: '蔬菜', nameEn: 'Iceberg Lettuce', calories: 14, protein: 0.9, carbs: 3.0, fat: 0.1, fiber: 1.2 },
  { name: '羽衣甘蓝', category: '蔬菜', nameEn: 'Kale', calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, fiber: 3.6 },
  { name: '芝麻菜', category: '蔬菜', nameEn: 'Arugula', calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, fiber: 1.6 },
  { name: '甜菜根', category: '蔬菜', nameEn: 'Beetroot', calories: 43, protein: 1.6, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 6.8 },
  { name: '荠菜', category: '蔬菜', nameEn: 'Shepherd Purse', calories: 27, protein: 2.9, carbs: 4.7, fat: 0.4, fiber: 1.7 },
  { name: '蕹菜', category: '蔬菜', nameEn: 'Water Spinach', calories: 19, protein: 1.9, carbs: 3.3, fat: 0.2, fiber: 1.4 },
  { name: '茼蒿', category: '蔬菜', nameEn: 'Garland Chrysanthemum', calories: 21, protein: 1.9, carbs: 3.9, fat: 0.4 },
  { name: '苋菜', category: '蔬菜', nameEn: 'Amaranth', calories: 23, protein: 2.0, carbs: 4.6, fat: 0.3, fiber: 2.2 },
  { name: '茴香', category: '蔬菜', nameEn: 'Fennel', calories: 31, protein: 1.2, carbs: 7.3, fat: 0.2, fiber: 3.1 },
  { name: '生姜', category: '蔬菜', nameEn: 'Fresh Ginger', calories: 80, protein: 1.8, carbs: 17.8, fat: 0.8 },
  { name: '玉米笋', category: '蔬菜', nameEn: 'Baby Corn', calories: 26, protein: 2.5, carbs: 6.0, fat: 0.2, fiber: 2.9 },
  { name: '蒜苗', category: '蔬菜', nameEn: 'Garlic Sprouts', calories: 38, protein: 2.1, carbs: 8.0, fat: 0.4, fiber: 1.8 },
  { name: '韭黄', category: '蔬菜', nameEn: 'Chinese Yellow Chive', calories: 22, protein: 2.3, carbs: 3.5, fat: 0.2, fiber: 1.6 },
  { name: '荸荠', category: '蔬菜', nameEn: 'Water Chestnut', calories: 59, protein: 1.2, carbs: 14.2, fat: 0.2, fiber: 1.1 },
  { name: '竹笋', category: '蔬菜', nameEn: 'Bamboo Shoots', calories: 27, protein: 2.6, carbs: 5.2, fat: 0.3, fiber: 2.2 },
  { name: '芦荟', category: '蔬菜', nameEn: 'Aloe Vera', calories: 4, protein: 0.0, carbs: 1.0, fat: 0 },
  { name: '番茄(小)', category: '蔬菜', nameEn: 'Cherry Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  { name: '甘蓝芽', category: '蔬菜', nameEn: 'Brussels Sprouts', calories: 43, protein: 3.4, carbs: 9.0, fat: 0.3, fiber: 3.8 },

  // ============================================================
  // 扩展：菌菇
  // ============================================================
  { name: '平菇', category: '菌菇', nameEn: 'Oyster Mushroom', calories: 33, protein: 3.3, carbs: 6.1, fat: 0.4, fiber: 2.3 },
  { name: '草菇', category: '菌菇', nameEn: 'Straw Mushroom', calories: 32, protein: 3.7, carbs: 5.1, fat: 0.3 },
  { name: '白蘑菇', category: '菌菇', nameEn: 'White Button Mushroom', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1.0 },
  { name: '蟹味菇', category: '菌菇', nameEn: 'Shimeji Mushroom', calories: 24, protein: 2.1, carbs: 4.0, fat: 0.2 },
  { name: '银耳', category: '菌菇', nameEn: 'White Fungus', calories: 200, protein: 10.0, carbs: 67.3, fat: 1.4, fiber: 30.4 },
  { name: '猴头菇', category: '菌菇', nameEn: "Lion's Mane Mushroom", calories: 13, protein: 2.0, carbs: 2.0, fat: 0.2 },
  { name: '羊肚菌', category: '菌菇', nameEn: 'Morel Mushroom', calories: 31, protein: 3.1, carbs: 5.1, fat: 0.6, fiber: 2.8 },
  { name: '松茸', category: '菌菇', nameEn: 'Matsutake', calories: 27, protein: 2.3, carbs: 4.5, fat: 0.6 },
  { name: '虫草花', category: '菌菇', nameEn: 'Cordyceps Flower', calories: 36, protein: 4.0, carbs: 5.5, fat: 0.7 },

  // ============================================================
  // 扩展：豆制品
  // ============================================================
  { name: '黄豆', category: '豆制品', nameEn: 'Dried Soybean', calories: 359, protein: 35.0, carbs: 18.7, fat: 16.0, fiber: 15.5 },
  { name: '黑豆', category: '豆制品', nameEn: 'Black Bean', calories: 401, protein: 36.0, carbs: 23.3, fat: 15.9, fiber: 10.2 },
  { name: '红豆', category: '豆制品', nameEn: 'Red Bean', calories: 324, protein: 20.2, carbs: 63.4, fat: 0.6, fiber: 7.7 },
  { name: '绿豆', category: '豆制品', nameEn: 'Mung Bean', calories: 329, protein: 21.6, carbs: 62.0, fat: 0.8, fiber: 6.4 },
  { name: '鹰嘴豆', category: '豆制品', nameEn: 'Chickpea', calories: 364, protein: 19.0, carbs: 60.7, fat: 6.0, fiber: 17.4 },
  { name: '扁豆', category: '豆制品', nameEn: 'Lentil', calories: 353, protein: 25.0, carbs: 60.0, fat: 1.1, fiber: 30.5 },
  { name: '蚕豆', category: '豆制品', nameEn: 'Fava Bean', calories: 335, protein: 26.0, carbs: 58.0, fat: 1.5, fiber: 25.0 },
  { name: '豆豉', category: '豆制品', nameEn: 'Fermented Black Bean', calories: 244, protein: 21.4, carbs: 21.3, fat: 8.0, sodium: 2000 },
  { name: '豆腐脑', category: '豆制品', nameEn: 'Tofu Pudding', calories: 47, protein: 4.5, carbs: 1.5, fat: 2.6 },
  { name: '油豆腐', category: '豆制品', nameEn: 'Fried Tofu', calories: 244, protein: 17.0, carbs: 6.0, fat: 17.6 },
  { name: '臭豆腐', category: '豆制品', nameEn: 'Stinky Tofu', calories: 130, protein: 16.0, carbs: 4.5, fat: 5.5 },
  { name: '日本豆腐', category: '豆制品', nameEn: 'Egg Tofu', calories: 63, protein: 5.0, carbs: 2.4, fat: 3.5 },
  { name: '味噌', category: '豆制品', nameEn: 'Miso Paste', calories: 199, protein: 11.7, carbs: 26.5, fat: 6.0, sodium: 3700 },
  { name: '纳豆', category: '豆制品', nameEn: 'Natto', calories: 211, protein: 19.4, carbs: 12.7, fat: 11.0, fiber: 5.4 },

  // ============================================================
  // 扩展：水果
  // ============================================================
  { name: '车厘子', category: '水果', nameEn: 'Cherry', calories: 50, protein: 1.0, carbs: 12.2, fat: 0.3, fiber: 1.6, sugar: 8.5 },
  { name: '蓝莓干', category: '水果', nameEn: 'Dried Blueberry', calories: 317, protein: 2.5, carbs: 80.0, fat: 2.5, fiber: 7.5, sugar: 64.0 },
  { name: '葡萄干', category: '水果', nameEn: 'Raisin', calories: 299, protein: 3.1, carbs: 79.0, fat: 0.5, fiber: 3.7, sugar: 59.0 },
  { name: '红枣(干)', category: '水果', nameEn: 'Dried Jujube', calories: 287, protein: 3.2, carbs: 73.0, fat: 0.5, fiber: 6.2, sugar: 53.0 },
  { name: '桂圆(干)', category: '水果', nameEn: 'Dried Longan', calories: 286, protein: 5.0, carbs: 73.5, fat: 0.4 },
  { name: '柿子', category: '水果', nameEn: 'Persimmon', calories: 71, protein: 0.6, carbs: 18.6, fat: 0.2, fiber: 3.6, sugar: 12.5 },
  { name: '石榴', category: '水果', nameEn: 'Pomegranate', calories: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4.0, sugar: 13.7 },
  { name: '杨桃', category: '水果', nameEn: 'Starfruit', calories: 31, protein: 1.0, carbs: 6.7, fat: 0.3, fiber: 2.8 },
  { name: '杨梅', category: '水果', nameEn: 'Bayberry', calories: 28, protein: 0.8, carbs: 6.7, fat: 0.2, fiber: 1.0 },
  { name: '哈密瓜', category: '水果', nameEn: 'Hami Melon', calories: 34, protein: 0.5, carbs: 7.9, fat: 0.1, fiber: 0.2, sugar: 7.0 },
  { name: '香瓜', category: '水果', nameEn: 'Cantaloupe', calories: 26, protein: 0.4, carbs: 6.2, fat: 0.1, sugar: 6.0 },
  { name: '李子', category: '水果', nameEn: 'Plum', calories: 36, protein: 0.7, carbs: 8.7, fat: 0.2, fiber: 0.9, sugar: 7.5 },
  { name: '枇杷', category: '水果', nameEn: 'Loquat', calories: 41, protein: 0.8, carbs: 9.3, fat: 0.2, fiber: 1.0, sugar: 6.0 },
  { name: '芭乐', category: '水果', nameEn: 'Guava', calories: 68, protein: 2.6, carbs: 14.3, fat: 1.0, fiber: 5.4, sugar: 8.9 },
  { name: '百香果', category: '水果', nameEn: 'Passion Fruit', calories: 97, protein: 2.2, carbs: 23.4, fat: 0.7, fiber: 10.4, sugar: 11.2 },
  { name: '榴莲', category: '水果', nameEn: 'Durian', calories: 147, protein: 2.6, carbs: 27.1, fat: 5.3, fiber: 3.8, sugar: 5.5 },
  { name: '山竹', category: '水果', nameEn: 'Mangosteen', calories: 73, protein: 0.4, carbs: 17.9, fat: 0.6, fiber: 1.8 },
  { name: '红毛丹', category: '水果', nameEn: 'Rambutan', calories: 82, protein: 0.7, carbs: 20.9, fat: 0.2 },
  { name: '椰肉', category: '水果', nameEn: 'Coconut Meat', calories: 354, protein: 3.3, carbs: 15.2, fat: 33.5, fiber: 9.0 },
  { name: '青提', category: '水果', nameEn: 'Green Grape', calories: 67, protein: 0.7, carbs: 18.0, fat: 0.2, fiber: 0.9, sugar: 15.4 },
  { name: '提子', category: '水果', nameEn: 'Red Grape', calories: 69, protein: 0.7, carbs: 18.1, fat: 0.2, sugar: 15.5 },
  { name: '青苹果', category: '水果', nameEn: 'Green Apple', calories: 58, protein: 0.4, carbs: 13.6, fat: 0.2, fiber: 2.8, sugar: 9.6 },
  { name: '黄桃罐头', category: '水果', nameEn: 'Canned Peach', calories: 74, protein: 0.6, carbs: 18.6, fat: 0.0, sugar: 17.5 },

  // ============================================================
  // 扩展：奶制品
  // ============================================================
  { name: '低脂牛奶', category: '奶制品', nameEn: 'Low-fat Milk', calories: 50, protein: 3.3, carbs: 5.0, fat: 1.5, sugar: 5.0, sodium: 44 },
  { name: '舒化奶', category: '奶制品', nameEn: 'Lactose-free Milk', calories: 58, protein: 3.0, carbs: 5.0, fat: 2.8, sodium: 60 },
  { name: '燕麦奶', category: '奶制品', nameEn: 'Oat Milk', calories: 47, protein: 1.0, carbs: 7.5, fat: 1.5, sugar: 4.0 },
  { name: '杏仁奶', category: '奶制品', nameEn: 'Almond Milk', calories: 17, protein: 0.6, carbs: 1.5, fat: 1.2, sugar: 0.0 },
  { name: '椰奶', category: '奶制品', nameEn: 'Coconut Milk', calories: 230, protein: 2.3, carbs: 6.0, fat: 24.0, sugar: 3.5 },
  { name: '奶粉(全脂)', category: '奶制品', nameEn: 'Whole Milk Powder', calories: 496, protein: 26.3, carbs: 38.4, fat: 26.7, sodium: 371 },
  { name: '炼乳', category: '奶制品', nameEn: 'Condensed Milk', calories: 321, protein: 7.9, carbs: 54.4, fat: 8.7, sugar: 54.4 },
  { name: '淡奶油', category: '奶制品', nameEn: 'Heavy Cream', calories: 340, protein: 2.8, carbs: 2.8, fat: 36.1, sodium: 40 },
  { name: '奶油芝士', category: '奶制品', nameEn: 'Cream Cheese', calories: 342, protein: 6.2, carbs: 4.1, fat: 34.0, sodium: 321 },
  { name: '帕玛森芝士', category: '奶制品', nameEn: 'Parmesan', calories: 431, protein: 38.5, carbs: 4.1, fat: 29.0, sodium: 1804 },
  { name: '切达芝士', category: '奶制品', nameEn: 'Cheddar', calories: 403, protein: 25.0, carbs: 1.3, fat: 33.1, sodium: 621 },
  { name: '蓝莓酸奶', category: '奶制品', nameEn: 'Blueberry Yogurt', calories: 91, protein: 3.1, carbs: 15.4, fat: 1.9, sugar: 13.5 },

  // ============================================================
  // 扩展：饮品
  // ============================================================
  { name: '黑咖啡', category: '饮品', nameEn: 'Black Coffee', calories: 1, protein: 0.1, carbs: 0, fat: 0 },
  { name: '卡布奇诺', category: '饮品', nameEn: 'Cappuccino', calories: 36, protein: 1.9, carbs: 2.8, fat: 1.9 },
  { name: '摩卡咖啡', category: '饮品', nameEn: 'Mocha', calories: 67, protein: 2.5, carbs: 9.5, fat: 2.5, sugar: 8.0 },
  { name: '焦糖玛奇朵', category: '饮品', nameEn: 'Caramel Macchiato', calories: 72, protein: 2.0, carbs: 11.0, fat: 2.5, sugar: 10.0 },
  { name: '抹茶拿铁', category: '饮品', nameEn: 'Matcha Latte', calories: 64, protein: 2.5, carbs: 9.0, fat: 2.0, sugar: 8.0 },
  { name: '苏打水', category: '饮品', nameEn: 'Soda Water', calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: '矿泉水', category: '饮品', nameEn: 'Mineral Water', calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: '柠檬水', category: '饮品', nameEn: 'Lemon Water', calories: 6, protein: 0.1, carbs: 2.0, fat: 0, sugar: 0.5 },
  { name: '苹果汁', category: '饮品', nameEn: 'Apple Juice', calories: 46, protein: 0.1, carbs: 11.3, fat: 0.1, sugar: 9.6 },
  { name: '葡萄汁', category: '饮品', nameEn: 'Grape Juice', calories: 60, protein: 0.4, carbs: 14.8, fat: 0.1, sugar: 14.2 },
  { name: '番茄汁', category: '饮品', nameEn: 'Tomato Juice', calories: 17, protein: 0.8, carbs: 4.2, fat: 0.1, sodium: 253 },
  { name: '芒果汁', category: '饮品', nameEn: 'Mango Juice', calories: 54, protein: 0.5, carbs: 13.0, fat: 0.2, sugar: 12.0 },
  { name: '红牛', category: '饮品', nameEn: 'Red Bull', calories: 45, protein: 0.4, carbs: 11.3, fat: 0, sugar: 11.0, sodium: 105 },
  { name: '冰红茶', category: '饮品', nameEn: 'Iced Black Tea (Sweet)', calories: 40, protein: 0.1, carbs: 9.7, fat: 0, sugar: 9.5 },
  { name: '威士忌', category: '饮品', nameEn: 'Whiskey', calories: 250, protein: 0, carbs: 0.1, fat: 0 },
  { name: '伏特加', category: '饮品', nameEn: 'Vodka', calories: 231, protein: 0, carbs: 0, fat: 0 },
  { name: '白葡萄酒', category: '饮品', nameEn: 'White Wine', calories: 82, protein: 0.1, carbs: 2.6, fat: 0 },
  { name: '香槟', category: '饮品', nameEn: 'Champagne', calories: 76, protein: 0.1, carbs: 1.5, fat: 0 },
  { name: '清酒', category: '饮品', nameEn: 'Sake', calories: 134, protein: 0.5, carbs: 5.0, fat: 0 },
  { name: '黄酒', category: '饮品', nameEn: 'Shaoxing Wine', calories: 132, protein: 1.0, carbs: 5.5, fat: 0 },
  { name: '豆奶', category: '饮品', nameEn: 'Soy Milk Drink', calories: 48, protein: 3.0, carbs: 4.5, fat: 1.8, sugar: 4.0 },
  { name: '酸梅汤', category: '饮品', nameEn: 'Sour Plum Soup', calories: 65, protein: 0.2, carbs: 16.0, fat: 0, sugar: 15.0 },

  // ============================================================
  // 扩展：速食与零食
  // ============================================================
  { name: '炸鸡', category: '速食', nameEn: 'Fried Chicken', calories: 320, protein: 19.0, carbs: 8.0, fat: 23.0, sodium: 800 },
  { name: '热狗', category: '速食', nameEn: 'Hot Dog', calories: 290, protein: 10.4, carbs: 24.0, fat: 17.0, sodium: 670 },
  { name: '玉米饼(Taco)', category: '速食', nameEn: 'Taco', calories: 226, protein: 9.0, carbs: 20.0, fat: 12.0, sodium: 397 },
  { name: '卷饼(Burrito)', category: '速食', nameEn: 'Burrito', calories: 215, protein: 9.0, carbs: 28.0, fat: 7.5 },
  { name: '咖喱饭', category: '速食', nameEn: 'Curry Rice', calories: 158, protein: 4.5, carbs: 26.5, fat: 4.0 },
  { name: '炒饭', category: '速食', nameEn: 'Fried Rice', calories: 163, protein: 5.0, carbs: 22.0, fat: 6.0 },
  { name: '宫保鸡丁', category: '速食', nameEn: 'Kung Pao Chicken', calories: 192, protein: 13.5, carbs: 8.0, fat: 12.0 },
  { name: '麻婆豆腐', category: '速食', nameEn: 'Mapo Tofu', calories: 143, protein: 10.0, carbs: 5.0, fat: 9.0 },
  { name: '回锅肉', category: '速食', nameEn: 'Twice-cooked Pork', calories: 285, protein: 12.0, carbs: 4.0, fat: 24.5 },
  { name: '糖醋里脊', category: '速食', nameEn: 'Sweet & Sour Pork', calories: 245, protein: 13.5, carbs: 22.0, fat: 11.5, sugar: 15.0 },
  { name: '鱼香肉丝', category: '速食', nameEn: 'Yu Xiang Pork', calories: 198, protein: 12.5, carbs: 10.0, fat: 12.0 },
  { name: '红烧排骨', category: '速食', nameEn: 'Braised Pork Ribs', calories: 295, protein: 15.0, carbs: 5.5, fat: 23.5 },
  { name: '辣子鸡', category: '速食', nameEn: 'Spicy Chicken', calories: 278, protein: 18.0, carbs: 8.0, fat: 19.5 },
  { name: '酸辣土豆丝', category: '速食', nameEn: 'Sour & Spicy Potato', calories: 86, protein: 1.8, carbs: 16.5, fat: 1.8 },
  { name: '清蒸鲈鱼', category: '速食', nameEn: 'Steamed Sea Bass Dish', calories: 124, protein: 19.5, carbs: 0, fat: 4.5 },
  { name: '小龙虾', category: '速食', nameEn: 'Crayfish', calories: 92, protein: 18.0, carbs: 0.4, fat: 1.5, sodium: 750 },
  { name: '酸菜鱼', category: '速食', nameEn: 'Suancai Fish', calories: 105, protein: 13.0, carbs: 3.0, fat: 4.5, sodium: 850 },
  { name: '麻辣烫', category: '速食', nameEn: 'Malatang', calories: 110, protein: 6.0, carbs: 10.0, fat: 5.5, sodium: 700 },
  { name: '糖葫芦', category: '速食', nameEn: 'Tanghulu', calories: 200, protein: 0.5, carbs: 50.0, fat: 0, sugar: 48.0 },
  { name: '月饼(豆沙)', category: '速食', nameEn: 'Red Bean Mooncake', calories: 350, protein: 6.0, carbs: 55.0, fat: 12.0, sugar: 35.0 },
  { name: '蛋挞', category: '速食', nameEn: 'Egg Tart', calories: 296, protein: 5.0, carbs: 28.0, fat: 18.0, sugar: 18.0 },
  { name: '甜甜圈', category: '速食', nameEn: 'Donut', calories: 452, protein: 4.9, carbs: 51.0, fat: 25.0, sugar: 23.0 },
  { name: '蛋糕(海绵)', category: '速食', nameEn: 'Sponge Cake', calories: 297, protein: 5.0, carbs: 56.0, fat: 4.6, sugar: 36.0 },
  { name: '芝士蛋糕', category: '速食', nameEn: 'Cheesecake', calories: 321, protein: 5.5, carbs: 25.5, fat: 22.5, sugar: 22.0 },
  { name: '提拉米苏', category: '速食', nameEn: 'Tiramisu', calories: 332, protein: 6.0, carbs: 38.0, fat: 17.0, sugar: 26.0 },
  { name: '麻糬', category: '速食', nameEn: 'Mochi', calories: 230, protein: 3.5, carbs: 50.0, fat: 1.5, sugar: 22.0 },
  { name: '威化饼干', category: '速食', nameEn: 'Wafer', calories: 502, protein: 5.0, carbs: 64.0, fat: 25.0, sugar: 40.0 },
  { name: '牛奶巧克力', category: '速食', nameEn: 'Milk Chocolate', calories: 535, protein: 7.7, carbs: 59.4, fat: 29.7, sugar: 51.5 },
  { name: '果冻', category: '速食', nameEn: 'Jelly', calories: 73, protein: 0.3, carbs: 18.0, fat: 0, sugar: 17.0 },
  { name: '棉花糖', category: '速食', nameEn: 'Marshmallow', calories: 318, protein: 1.8, carbs: 81.0, fat: 0.2, sugar: 58.0 },
  { name: '寿司卷', category: '速食', nameEn: 'Sushi Roll', calories: 156, protein: 5.8, carbs: 30.0, fat: 1.5, sodium: 590 },
  { name: '日式拉面', category: '速食', nameEn: 'Ramen', calories: 142, protein: 6.8, carbs: 22.0, fat: 3.5, sodium: 1100 },
  { name: '韩式拌饭', category: '速食', nameEn: 'Bibimbap', calories: 145, protein: 5.5, carbs: 22.0, fat: 4.0 },
  { name: '韩式泡菜', category: '速食', nameEn: 'Kimchi', calories: 23, protein: 1.8, carbs: 4.0, fat: 0.5, fiber: 1.6, sodium: 670 },

  // ============================================================
  // 扩展：调味料
  // ============================================================
  { name: '老抽', category: '调味料', nameEn: 'Dark Soy Sauce', calories: 70, protein: 5.0, carbs: 10.0, fat: 0.1, sodium: 6900 },
  { name: '料酒', category: '调味料', nameEn: 'Cooking Wine', calories: 70, protein: 0.5, carbs: 3.0, fat: 0, sodium: 350 },
  { name: '味精', category: '调味料', nameEn: 'MSG', calories: 0, protein: 8.5, carbs: 0, fat: 0, sodium: 12000 },
  { name: '鸡精', category: '调味料', nameEn: 'Chicken Bouillon', calories: 162, protein: 9.0, carbs: 23.0, fat: 4.5, sodium: 17000 },
  { name: '五香粉', category: '调味料', nameEn: 'Five Spice', calories: 343, protein: 11.0, carbs: 50.0, fat: 13.0 },
  { name: '花椒粉', category: '调味料', nameEn: 'Sichuan Peppercorn', calories: 311, protein: 6.7, carbs: 65.0, fat: 8.3 },
  { name: '辣椒粉', category: '调味料', nameEn: 'Chili Powder', calories: 282, protein: 13.5, carbs: 50.0, fat: 14.3 },
  { name: '咖喱粉', category: '调味料', nameEn: 'Curry Powder', calories: 325, protein: 14.3, carbs: 55.8, fat: 14.0, fiber: 53.2 },
  { name: '黑胡椒', category: '调味料', nameEn: 'Black Pepper', calories: 251, protein: 10.4, carbs: 64.0, fat: 3.3 },
  { name: '芥末', category: '调味料', nameEn: 'Mustard', calories: 66, protein: 4.0, carbs: 5.0, fat: 4.0, sodium: 1135 },
  { name: '酱油(零钠)', category: '调味料', nameEn: 'Low Sodium Soy Sauce', calories: 55, protein: 8.5, carbs: 5.5, fat: 0.1, sodium: 2400 },
  { name: '芝麻酱', category: '调味料', nameEn: 'Sesame Paste', calories: 618, protein: 19.2, carbs: 22.0, fat: 52.7 },
  { name: '甜面酱', category: '调味料', nameEn: 'Sweet Bean Sauce', calories: 138, protein: 5.5, carbs: 28.0, fat: 0.6, sugar: 18.0, sodium: 3700 },
  { name: '芥末酱(日式)', category: '调味料', nameEn: 'Wasabi', calories: 109, protein: 4.8, carbs: 23.5, fat: 0.6 },
  { name: '柠檬汁', category: '调味料', nameEn: 'Lemon Juice', calories: 22, protein: 0.4, carbs: 6.9, fat: 0.2, sugar: 2.5 },
  { name: '玉米油', category: '调味料', nameEn: 'Corn Oil', calories: 884, protein: 0, carbs: 0, fat: 100.0 },
  { name: '葵花籽油', category: '调味料', nameEn: 'Sunflower Oil', calories: 884, protein: 0, carbs: 0, fat: 100.0 },
  { name: '椰子油', category: '调味料', nameEn: 'Coconut Oil', calories: 862, protein: 0, carbs: 0, fat: 100.0 },
  { name: '猪油', category: '调味料', nameEn: 'Lard', calories: 902, protein: 0, carbs: 0, fat: 100.0 },
  { name: '红糖', category: '调味料', nameEn: 'Brown Sugar', calories: 380, protein: 0.1, carbs: 98.0, fat: 0, sugar: 97.0 },
  { name: '冰糖', category: '调味料', nameEn: 'Rock Sugar', calories: 397, protein: 0, carbs: 99.0, fat: 0, sugar: 99.0 },
];

async function main() {
  console.log(`🌱 Seeding ${foods.length} foods with categories...`);

  // 仅删除未被任何 FoodLog 引用的旧 seed 食物，避免影响用户历史记录
  const deleted = await prisma.food.deleteMany({
    where: {
      isCustom: false,
      source: { in: ['seed', 'custom'] },
      foodLogs: { none: {} },
    },
  });
  console.log(`  Cleared ${deleted.count} orphan seed foods`);

  // 已存在的 seed 食物（按 name 索引）
  const existingFoods = await prisma.food.findMany({
    where: { isCustom: false, source: 'seed' },
    select: { id: true, name: true },
  });
  const existingNames = new Set(existingFoods.map(f => f.name));

  // 批量创建新增的
  const newFoods = foods
    .filter(f => !existingNames.has(f.name))
    .map(food => ({
      name: food.name,
      category: food.category,
      nameEn: food.nameEn || null,
      servingUnit: food.servingUnit || 'g',
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber ?? null,
      sugar: food.sugar ?? null,
      sodium: food.sodium ?? null,
      source: 'seed',
      isCustom: false,
      userId: null,
    }));

  if (newFoods.length > 0) {
    const result = await prisma.food.createMany({ data: newFoods });
    console.log(`✅ Added ${result.count} new foods`);
  } else {
    console.log(`✅ No new foods to add (${existingNames.size} already present)`);
  }

  const total = await prisma.food.count({ where: { isCustom: false } });
  console.log(`📊 Total seed foods in DB: ${total}`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => prisma.$disconnect());