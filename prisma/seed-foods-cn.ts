/**
 * 基于《中国食物成分表标准版(第6版)》公开数据的扩充种子脚本
 * 所有数值为每100g可食部分: calories(kcal), protein/carbs/fat/fiber/sugar/sodium(g)
 * 运行: npx tsx prisma/seed-foods-cn.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FoodSeed {
  name: string;
  category: string;
  nameEn?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

const foods: FoodSeed[] = [
  // ==================== 谷类及制品 ====================
  { name: '小麦粉(标准粉)', category: '主食', nameEn: 'Wheat Flour', calories: 344, protein: 11.2, carbs: 71.5, fat: 1.5, fiber: 2.1, sodium: 3.1 },
  { name: '小麦粉(富强粉)', category: '主食', nameEn: 'Refined Wheat Flour', calories: 350, protein: 10.3, carbs: 74.6, fat: 0.6, fiber: 0.6 },
  { name: '高粱米', category: '主食', nameEn: 'Sorghum', calories: 351, protein: 10.4, carbs: 74.7, fat: 3.1, fiber: 4.3 },
  { name: '荞麦', category: '主食', nameEn: 'Buckwheat', calories: 324, protein: 9.3, carbs: 66.5, fat: 2.3, fiber: 6.5 },
  { name: '黑米', category: '主食', nameEn: 'Black Rice', calories: 333, protein: 9.4, carbs: 68.3, fat: 2.5, fiber: 3.9 },
  { name: '糯米(江米)', category: '主食', nameEn: 'Glutinous Rice', calories: 348, protein: 7.3, carbs: 77.5, fat: 1.0, fiber: 0.8 },
  { name: '小米(黄)', category: '主食', nameEn: 'Millet', calories: 358, protein: 9.0, carbs: 75.1, fat: 3.1, fiber: 1.6 },
  { name: '玉米(干)', category: '主食', nameEn: 'Dried Corn', calories: 335, protein: 8.7, carbs: 66.6, fat: 3.8, fiber: 5.6 },
  { name: '玉米面(黄)', category: '主食', nameEn: 'Corn Flour', calories: 341, protein: 8.1, carbs: 69.6, fat: 3.3, fiber: 5.6 },
  { name: '大麦', category: '主食', nameEn: 'Barley', calories: 307, protein: 10.2, carbs: 63.4, fat: 1.4, fiber: 9.9 },
  { name: '薏米', category: '主食', nameEn: 'Job\'s Tears', calories: 357, protein: 12.8, carbs: 69.1, fat: 3.3, fiber: 2.0 },
  { name: '烙饼', category: '主食', nameEn: 'Griddle Cake', calories: 259, protein: 8.5, carbs: 51.0, fat: 3.0, fiber: 1.2 },
  { name: '面包(咸)', category: '主食', nameEn: 'Salted Bread', calories: 265, protein: 8.8, carbs: 50.5, fat: 2.5, fiber: 1.2, sodium: 526 },
  { name: '挂面(煮)', category: '主食', nameEn: 'Dried Noodle Cooked', calories: 109, protein: 3.7, carbs: 22.3, fat: 0.2 },
  { name: '河粉(熟)', category: '主食', nameEn: 'Rice Noodle', calories: 116, protein: 2.0, carbs: 26.3, fat: 0.3 },
  { name: '乌冬面(熟)', category: '主食', nameEn: 'Udon Noodle', calories: 95, protein: 2.5, carbs: 20.1, fat: 0.2 },
  { name: '粉丝(干)', category: '主食', nameEn: 'Glass Noodle Dry', calories: 335, protein: 0.8, carbs: 83.7, fat: 0.1 },
  { name: '粉条(熟)', category: '主食', nameEn: 'Sweet Potato Noodle Cooked', calories: 78, protein: 0.2, carbs: 19.2, fat: 0.0 },
  { name: '方便面', category: '主食', nameEn: 'Instant Noodle', calories: 473, protein: 9.5, carbs: 61.6, fat: 21.1, fiber: 0.7, sodium: 1144 },
  { name: '饼干(苏打)', category: '主食', nameEn: 'Soda Cracker', calories: 408, protein: 8.8, carbs: 76.2, fat: 7.7, fiber: 0.7, sodium: 697 },
  { name: '糕点(蛋糕)', category: '主食', nameEn: 'Sponge Cake', calories: 347, protein: 8.6, carbs: 52.5, fat: 12.0, sugar: 28.1 },
  { name: '月饼(豆沙)', category: '速食', nameEn: 'Mooncake Red Bean', calories: 405, protein: 8.2, carbs: 61.2, fat: 14.2, fiber: 1.8 },
  { name: '煎饼', category: '主食', nameEn: 'Chinese Pancake', calories: 335, protein: 7.8, carbs: 62.1, fat: 6.5 },
  { name: '窝窝头', category: '主食', nameEn: 'Corn Bun', calories: 188, protein: 5.1, carbs: 40.2, fat: 0.6, fiber: 1.5 },

  // ==================== 豆类及制品 ====================
  { name: '黄豆(干)', category: '豆制品', nameEn: 'Soybean Dry', calories: 359, protein: 35.0, carbs: 25.3, fat: 16.0, fiber: 15.5 },
  { name: '黑豆', category: '豆制品', nameEn: 'Black Soybean', calories: 381, protein: 36.0, carbs: 23.3, fat: 15.9, fiber: 10.2 },
  { name: '青豆', category: '豆制品', nameEn: 'Green Soybean', calories: 373, protein: 34.5, carbs: 25.5, fat: 16.0, fiber: 12.6 },
  { name: '绿豆', category: '豆制品', nameEn: 'Mung Bean', calories: 316, protein: 21.6, carbs: 55.6, fat: 0.8, fiber: 6.4 },
  { name: '红豆', category: '豆制品', nameEn: 'Red Bean', calories: 309, protein: 20.2, carbs: 55.7, fat: 0.6, fiber: 7.7 },
  { name: '蚕豆', category: '豆制品', nameEn: 'Broad Bean', calories: 335, protein: 21.6, carbs: 55.9, fat: 1.0, fiber: 3.1 },
  { name: '豌豆(干)', category: '豆制品', nameEn: 'Dried Pea', calories: 313, protein: 20.3, carbs: 55.4, fat: 1.1, fiber: 10.4 },
  { name: '豆腐(南)', category: '豆制品', nameEn: 'Silken Tofu', calories: 57, protein: 6.2, carbs: 2.1, fat: 2.5 },
  { name: '豆腐(北)', category: '豆制品', nameEn: 'Firm Tofu', calories: 98, protein: 12.2, carbs: 1.5, fat: 4.8 },
  { name: '豆腐干', category: '豆制品', nameEn: 'Dried Tofu', calories: 140, protein: 16.2, carbs: 3.6, fat: 6.6 },
  { name: '内酯豆腐', category: '豆制品', nameEn: 'Lactoferrin Tofu', calories: 49, protein: 5.0, carbs: 2.5, fat: 1.9 },
  { name: '豆腐皮', category: '豆制品', nameEn: 'Tofu Skin', calories: 409, protein: 44.6, carbs: 5.1, fat: 23.7 },
  { name: '油豆腐', category: '豆制品', nameEn: 'Fried Tofu', calories: 244, protein: 17.0, carbs: 4.4, fat: 17.6 },
  { name: '腐竹(干)', category: '豆制品', nameEn: 'Dried Tofu Stick', calories: 459, protein: 44.6, carbs: 22.3, fat: 21.7, fiber: 1.0 },
  { name: '豆浆', category: '豆制品', nameEn: 'Soy Milk', calories: 31, protein: 3.0, carbs: 1.2, fat: 1.6 },
  { name: '纳豆', category: '豆制品', nameEn: 'Natto', calories: 212, protein: 16.5, carbs: 15.4, fat: 11.0, fiber: 6.7, sodium: 2 },
  { name: '豆豉', category: '调味料', nameEn: 'Fermented Black Bean', calories: 244, protein: 25.6, carbs: 24.9, fat: 5.3, sodium: 3000 },
  { name: '豆瓣酱', category: '调味料', nameEn: 'Doubanjiang', calories: 181, protein: 10.9, carbs: 22.5, fat: 4.6, sodium: 5600 },

  // ==================== 蔬菜类 ====================
  { name: '大白菜', category: '蔬菜', nameEn: 'Chinese Cabbage', calories: 18, protein: 1.4, carbs: 2.4, fat: 0.2, fiber: 0.8, sodium: 48 },
  { name: '小白菜', category: '蔬菜', nameEn: 'Bok Choy', calories: 16, protein: 1.5, carbs: 1.8, fat: 0.3, fiber: 1.1 },
  { name: '卷心菜', category: '蔬菜', nameEn: 'Cabbage', calories: 22, protein: 1.5, carbs: 3.4, fat: 0.2, fiber: 1.0, sodium: 27 },
  { name: '油菜', category: '蔬菜', nameEn: 'Rapeseed', calories: 25, protein: 1.8, carbs: 2.9, fat: 0.5, fiber: 1.1 },
  { name: '菠菜', category: '蔬菜', nameEn: 'Spinach', calories: 28, protein: 2.6, carbs: 2.8, fat: 0.3, fiber: 1.7, sodium: 85 },
  { name: '生菜', category: '蔬菜', nameEn: 'Lettuce', calories: 16, protein: 1.4, carbs: 1.5, fat: 0.4, fiber: 0.7, sodium: 32 },
  { name: '芹菜', category: '蔬菜', nameEn: 'Celery', calories: 20, protein: 1.2, carbs: 3.9, fat: 0.2, fiber: 1.4, sodium: 73 },
  { name: '韭菜', category: '蔬菜', nameEn: 'Chinese Chive', calories: 29, protein: 2.4, carbs: 3.2, fat: 0.4, fiber: 1.4 },
  { name: '茼蒿', category: '蔬菜', nameEn: 'Crown Daisy', calories: 24, protein: 1.9, carbs: 2.7, fat: 0.3, fiber: 1.2 },
  { name: '空心菜', category: '蔬菜', nameEn: 'Water Spinach', calories: 21, protein: 2.2, carbs: 2.2, fat: 0.3, fiber: 1.4 },
  { name: '苋菜', category: '蔬菜', nameEn: 'Amaranth', calories: 25, protein: 2.8, carbs: 2.8, fat: 0.4, fiber: 1.8 },
  { name: '西兰花', category: '蔬菜', nameEn: 'Broccoli', calories: 33, protein: 4.1, carbs: 3.7, fat: 0.6, fiber: 1.6, sodium: 18 },
  { name: '菜花', category: '蔬菜', nameEn: 'Cauliflower', calories: 24, protein: 2.1, carbs: 3.0, fat: 0.2, fiber: 1.2, sodium: 31 },
  { name: '番茄(西红柿)', category: '蔬菜', nameEn: 'Tomato', calories: 15, protein: 0.9, carbs: 2.5, fat: 0.2, fiber: 0.5, sugar: 2.1, sodium: 5 },
  { name: '黄瓜', category: '蔬菜', nameEn: 'Cucumber', calories: 15, protein: 0.8, carbs: 2.4, fat: 0.2, fiber: 0.5, sugar: 1.7, sodium: 4 },
  { name: '冬瓜', category: '蔬菜', nameEn: 'Winter Melon', calories: 11, protein: 0.4, carbs: 2.4, fat: 0.2, fiber: 0.7, sodium: 1 },
  { name: '南瓜', category: '蔬菜', nameEn: 'Pumpkin', calories: 22, protein: 0.7, carbs: 4.5, fat: 0.1, fiber: 0.8, sugar: 2.8, sodium: 0.8 },
  { name: '茄子', category: '蔬菜', nameEn: 'Eggplant', calories: 21, protein: 1.1, carbs: 3.6, fat: 0.2, fiber: 1.3, sodium: 5 },
  { name: '辣椒(青)', category: '蔬菜', nameEn: 'Green Pepper', calories: 27, protein: 1.3, carbs: 5.3, fat: 0.4, fiber: 2.1 },
  { name: '甜椒(彩椒)', category: '蔬菜', nameEn: 'Bell Pepper', calories: 30, protein: 1.0, carbs: 6.2, fat: 0.2, fiber: 1.4, sugar: 4.2 },
  { name: '苦瓜', category: '蔬菜', nameEn: 'Bitter Melon', calories: 19, protein: 1.0, carbs: 3.5, fat: 0.1, fiber: 1.4 },
  { name: '丝瓜', category: '蔬菜', nameEn: 'Luffa', calories: 20, protein: 1.0, carbs: 3.6, fat: 0.2, fiber: 0.6, sodium: 2.6 },
  { name: '豇豆(长豆角)', category: '蔬菜', nameEn: 'Cowpea', calories: 29, protein: 2.7, carbs: 5.0, fat: 0.3, fiber: 1.8 },
  { name: '四季豆', category: '蔬菜', nameEn: 'Green Bean', calories: 28, protein: 2.0, carbs: 4.8, fat: 0.4, fiber: 1.5 },
  { name: '荷兰豆', category: '蔬菜', nameEn: 'Snow Pea', calories: 30, protein: 3.4, carbs: 4.2, fat: 0.4, fiber: 1.3 },
  { name: '毛豆', category: '蔬菜', nameEn: 'Edamame', calories: 131, protein: 13.1, carbs: 10.5, fat: 5.0, fiber: 4.0, sodium: 3 },
  { name: '洋葱', category: '蔬菜', nameEn: 'Onion', calories: 39, protein: 1.1, carbs: 8.0, fat: 0.2, fiber: 0.9, sugar: 4.2, sodium: 4 },
  { name: '大葱', category: '蔬菜', nameEn: 'Chinese Green Onion', calories: 30, protein: 1.7, carbs: 5.8, fat: 0.3, fiber: 1.3 },
  { name: '大蒜', category: '蔬菜', nameEn: 'Garlic', calories: 126, protein: 4.5, carbs: 25.5, fat: 0.2, fiber: 1.1, sodium: 19 },
  { name: '生姜', category: '蔬菜', nameEn: 'Ginger', calories: 41, protein: 1.3, carbs: 9.0, fat: 0.6, fiber: 2.7, sodium: 14 },
  { name: '胡萝卜(红)', category: '蔬菜', nameEn: 'Carrot', calories: 37, protein: 1.0, carbs: 7.7, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 71 },
  { name: '白萝卜', category: '蔬菜', nameEn: 'Daikon Radish', calories: 20, protein: 0.7, carbs: 4.1, fat: 0.1, fiber: 1.0, sodium: 61 },
  { name: '莲藕', category: '蔬菜', nameEn: 'Lotus Root', calories: 70, protein: 1.9, carbs: 15.2, fat: 0.2, fiber: 1.2, sodium: 44 },
  { name: '山药', category: '蔬菜', nameEn: 'Chinese Yam', calories: 56, protein: 1.9, carbs: 11.6, fat: 0.2, fiber: 0.8 },
  { name: '芋头', category: '蔬菜', nameEn: 'Taro', calories: 79, protein: 2.2, carbs: 17.1, fat: 0.2, fiber: 1.0, sodium: 33 },
  { name: '竹笋', category: '蔬菜', nameEn: 'Bamboo Shoot', calories: 19, protein: 2.6, carbs: 1.8, fat: 0.2, fiber: 1.8 },
  { name: '莴笋(莴苣)', category: '蔬菜', nameEn: 'Celtuce', calories: 15, protein: 1.0, carbs: 2.2, fat: 0.1, fiber: 0.6 },
  { name: '玉米笋', category: '蔬菜', nameEn: 'Baby Corn', calories: 27, protein: 1.9, carbs: 5.0, fat: 0.1, fiber: 1.7 },
  { name: '芦笋', category: '蔬菜', nameEn: 'Asparagus', calories: 22, protein: 2.2, carbs: 3.0, fat: 0.2, fiber: 1.4, sodium: 2 },
  { name: '西葫芦', category: '蔬菜', nameEn: 'Zucchini', calories: 18, protein: 0.8, carbs: 3.3, fat: 0.2, fiber: 0.6, sodium: 3 },
  { name: '菠萝蜜(果肉)', category: '蔬菜', nameEn: 'Jackfruit', calories: 95, protein: 1.5, carbs: 22.5, fat: 0.3, fiber: 1.5 },
  { name: '百合(鲜)', category: '蔬菜', nameEn: 'Lily Bulb Fresh', calories: 166, protein: 3.2, carbs: 38.8, fat: 0.1, fiber: 1.7 },
  { name: '荸荠', category: '蔬菜', nameEn: 'Water Chestnut', calories: 59, protein: 1.5, carbs: 12.9, fat: 0.2, fiber: 1.1 },
  { name: '茭白', category: '蔬菜', nameEn: 'Water Bamboo', calories: 23, protein: 1.2, carbs: 4.0, fat: 0.2, fiber: 1.9 },

  // ==================== 菌藻类 ====================
  { name: '香菇(干)', category: '菌菇', nameEn: 'Dried Shiitake', calories: 274, protein: 20.0, carbs: 61.7, fat: 1.2, fiber: 31.6, sodium: 11 },
  { name: '香菇(鲜)', category: '菌菇', nameEn: 'Fresh Shiitake', calories: 26, protein: 2.2, carbs: 5.2, fat: 0.3, fiber: 3.3 },
  { name: '平菇', category: '菌菇', nameEn: 'Oyster Mushroom', calories: 20, protein: 1.9, carbs: 4.6, fat: 0.3, fiber: 2.3 },
  { name: '金针菇', category: '菌菇', nameEn: 'Enoki Mushroom', calories: 32, protein: 2.4, carbs: 6.0, fat: 0.4, fiber: 2.7 },
  { name: '杏鲍菇', category: '菌菇', nameEn: 'King Oyster Mushroom', calories: 35, protein: 1.3, carbs: 8.3, fat: 0.1, fiber: 3.0 },
  { name: '蟹味菇', category: '菌菇', nameEn: 'Beech Mushroom', calories: 27, protein: 2.0, carbs: 5.5, fat: 0.5, fiber: 1.6 },
  { name: '茶树菇', category: '菌菇', nameEn: 'Tea Tree Mushroom', calories: 279, protein: 23.1, carbs: 43.5, fat: 2.6, fiber: 14.4 },
  { name: '银耳(干)', category: '菌菇', nameEn: 'White Fungus Dry', calories: 200, protein: 10.0, carbs: 67.3, fat: 1.4, fiber: 30.4 },
  { name: '银耳(鲜)', category: '菌菇', nameEn: 'White Fungus Fresh', calories: 15, protein: 1.0, carbs: 6.7, fat: 0.1, fiber: 2.6 },
  { name: '黑木耳(干)', category: '菌菇', nameEn: 'Black Fungus Dry', calories: 205, protein: 12.1, carbs: 65.6, fat: 1.5, fiber: 29.9, sodium: 48 },
  { name: '黑木耳(水发)', category: '菌菇', nameEn: 'Rehydrated Black Fungus', calories: 21, protein: 1.5, carbs: 6.0, fat: 0.2, fiber: 2.6 },
  { name: '猴头菇', category: '菌菇', nameEn: 'Lion Mane Mushroom', calories: 13, protein: 2.0, carbs: 4.9, fat: 0.2, fiber: 4.2 },
  { name: '口蘑', category: '菌菇', nameEn: 'White Button Mushroom', calories: 242, protein: 38.7, carbs: 31.6, fat: 3.3, fiber: 17.2 },
  { name: '竹荪(干)', category: '菌菇', nameEn: 'Bamboo Fungus Dry', calories: 262, protein: 19.4, carbs: 60.4, fat: 2.6, fiber: 8.4 },
  { name: '海带(鲜)', category: '菌菇', nameEn: 'Kelp Fresh', calories: 13, protein: 1.2, carbs: 2.1, fat: 0.1, fiber: 0.5, sodium: 8 },
  { name: '海带(干)', category: '菌菇', nameEn: 'Kelp Dry', calories: 77, protein: 8.2, carbs: 56.2, fat: 0.1, fiber: 6.1, sodium: 327 },
  { name: '紫菜(干)', category: '菌菇', nameEn: 'Nori Dry', calories: 207, protein: 26.7, carbs: 44.1, fat: 1.1, fiber: 21.6, sodium: 710 },
  { name: '裙带菜', category: '菌菇', nameEn: 'Wakame', calories: 45, protein: 3.0, carbs: 9.1, fat: 0.6, fiber: 3.0, sodium: 872 },

  // ==================== 水果类 ====================
  { name: '苹果', category: '水果', nameEn: 'Apple', calories: 52, protein: 0.2, carbs: 12.3, fat: 0.2, fiber: 1.2, sugar: 10.4 },
  { name: '梨(白梨)', category: '水果', nameEn: 'Pear', calories: 44, protein: 0.3, carbs: 10.2, fat: 0.2, fiber: 3.1, sugar: 9.8 },
  { name: '桃子', category: '水果', nameEn: 'Peach', calories: 48, protein: 0.9, carbs: 10.9, fat: 0.1, fiber: 1.3, sugar: 8.4 },
  { name: '李子', category: '水果', nameEn: 'Plum', calories: 46, protein: 0.7, carbs: 10.5, fat: 0.2, fiber: 0.9, sugar: 9.9 },
  { name: '杏', category: '水果', nameEn: 'Apricot', calories: 36, protein: 0.9, carbs: 7.8, fat: 0.1, fiber: 1.3, sugar: 9.2 },
  { name: '樱桃', category: '水果', nameEn: 'Cherry', calories: 46, protein: 1.1, carbs: 9.9, fat: 0.2, fiber: 0.3, sugar: 8.0 },
  { name: '葡萄', category: '水果', nameEn: 'Grape', calories: 43, protein: 0.5, carbs: 9.9, fat: 0.2, fiber: 0.4, sugar: 15.5 },
  { name: '草莓', category: '水果', nameEn: 'Strawberry', calories: 32, protein: 1.0, carbs: 6.2, fat: 0.2, fiber: 1.1, sugar: 4.9, sodium: 4 },
  { name: '蓝莓', category: '水果', nameEn: 'Blueberry', calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10.0 },
  { name: '柠檬', category: '水果', nameEn: 'Lemon', calories: 35, protein: 1.1, carbs: 6.2, fat: 0.5, fiber: 1.3, sugar: 2.5 },
  { name: '柚子', category: '水果', nameEn: 'Grapefruit', calories: 41, protein: 0.8, carbs: 8.4, fat: 0.2, fiber: 0.4, sugar: 7.0 },
  { name: '橙子', category: '水果', nameEn: 'Orange', calories: 47, protein: 0.8, carbs: 11.1, fat: 0.2, fiber: 0.6, sugar: 9.4 },
  { name: '橘子', category: '水果', nameEn: 'Tangerine', calories: 43, protein: 0.8, carbs: 9.2, fat: 0.2, fiber: 1.4, sugar: 9.1 },
  { name: '哈密瓜', category: '水果', nameEn: 'Hami Melon', calories: 34, protein: 0.5, carbs: 7.7, fat: 0.1, fiber: 0.2, sugar: 8.1 },
  { name: '木瓜', category: '水果', nameEn: 'Papaya', calories: 39, protein: 0.6, carbs: 9.2, fat: 0.1, fiber: 0.8, sugar: 5.9 },
  { name: '火龙果', category: '水果', nameEn: 'Dragon Fruit', calories: 51, protein: 1.1, carbs: 11.0, fat: 0.4, fiber: 1.6, sugar: 9.0 },
  { name: '百香果', category: '水果', nameEn: 'Passion Fruit', calories: 97, protein: 2.2, carbs: 23.4, fat: 0.7, fiber: 10.4 },
  { name: '猕猴桃', category: '水果', nameEn: 'Kiwi', calories: 61, protein: 0.8, carbs: 14.0, fat: 0.6, fiber: 3.0, sugar: 8.9 },
  { name: '芒果', category: '水果', nameEn: 'Mango', calories: 65, protein: 0.6, carbs: 15.0, fat: 0.3, fiber: 1.3, sugar: 13.7 },
  { name: '荔枝', category: '水果', nameEn: 'Lychee', calories: 66, protein: 0.9, carbs: 16.1, fat: 0.2, fiber: 0.5 },
  { name: '龙眼(桂圆)', category: '水果', nameEn: 'Longan', calories: 71, protein: 1.2, carbs: 16.2, fat: 0.1, fiber: 0.4 },
  { name: '椰子肉', category: '水果', nameEn: 'Coconut Flesh', calories: 241, protein: 2.6, carbs: 23.7, fat: 15.1, fiber: 4.7 },
  { name: '石榴', category: '水果', nameEn: 'Pomegranate', calories: 63, protein: 1.4, carbs: 13.7, fat: 0.2, fiber: 4.3 },
  { name: '枇杷', category: '水果', nameEn: 'Loquat', calories: 39, protein: 0.8, carbs: 8.5, fat: 0.2, fiber: 0.8 },
  { name: '柿子', category: '水果', nameEn: 'Persimmon', calories: 71, protein: 0.7, carbs: 15.9, fat: 0.1, fiber: 1.4, sugar: 12.5 },
  { name: '枣(鲜)', category: '水果', nameEn: 'Fresh Jujube', calories: 122, protein: 1.2, carbs: 28.6, fat: 0.3, fiber: 1.9, sugar: 20.2 },
  { name: '枣(干)', category: '水果', nameEn: 'Dried Jujube', calories: 264, protein: 3.2, carbs: 67.8, fat: 0.5, fiber: 6.2 },
  { name: '葡萄干', category: '水果', nameEn: 'Raisin', calories: 299, protein: 2.5, carbs: 79.1, fat: 0.4, fiber: 1.0 },

  // ==================== 畜肉类及制品 ====================
  { name: '牛腱子肉', category: '肉禽', nameEn: 'Beef Shank', calories: 106, protein: 21.3, carbs: 0.0, fat: 2.0, sodium: 52 },
  { name: '牛里脊', category: '肉禽', nameEn: 'Beef Tenderloin', calories: 107, protein: 22.2, carbs: 0.4, fat: 0.9, sodium: 45 },
  { name: '牛上脑', category: '肉禽', nameEn: 'Beef Chuck', calories: 125, protein: 21.0, carbs: 0, fat: 4.2 },
  { name: '牛排(生)', category: '肉禽', nameEn: 'Beef Steak Raw', calories: 143, protein: 19.9, carbs: 0, fat: 6.9 },
  { name: '牛肉干', category: '肉禽', nameEn: 'Beef Jerky', calories: 550, protein: 45.6, carbs: 1.9, fat: 40.0, sodium: 1940 },
  { name: '牛肝', category: '肉禽', nameEn: 'Beef Liver', calories: 139, protein: 19.8, carbs: 6.2, fat: 3.9 },
  { name: '羊肉(瘦)', category: '肉禽', nameEn: 'Lean Lamb', calories: 118, protein: 20.5, carbs: 0.0, fat: 3.9, sodium: 80 },
  { name: '羊腿肉', category: '肉禽', nameEn: 'Lamb Leg', calories: 148, protein: 17.3, carbs: 0, fat: 8.8 },
  { name: '羊排', category: '肉禽', nameEn: 'Lamb Ribs', calories: 203, protein: 13.6, carbs: 0, fat: 16.6 },
  { name: '猪前腿肉', category: '肉禽', nameEn: 'Pork Shoulder', calories: 179, protein: 17.6, carbs: 0, fat: 11.5 },
  { name: '猪颈肉', category: '肉禽', nameEn: 'Pork Neck', calories: 283, protein: 15.0, carbs: 0, fat: 25.0 },
  { name: '猪蹄', category: '肉禽', nameEn: 'Pig Trotter', calories: 260, protein: 22.6, carbs: 0, fat: 18.8, sodium: 101 },
  { name: '猪心', category: '肉禽', nameEn: 'Pork Heart', calories: 119, protein: 16.9, carbs: 1.1, fat: 5.3 },
  { name: '猪肺', category: '肉禽', nameEn: 'Pork Lung', calories: 84, protein: 12.2, carbs: 1.7, fat: 2.9 },
  { name: '猪肾(腰花)', category: '肉禽', nameEn: 'Pork Kidney', calories: 96, protein: 15.5, carbs: 1.2, fat: 3.2 },
  { name: '猪大肠', category: '肉禽', nameEn: 'Pork Intestine', calories: 196, protein: 6.9, carbs: 0, fat: 18.7 },
  { name: '猪血', category: '肉禽', nameEn: 'Pork Blood', calories: 55, protein: 12.2, carbs: 0.9, fat: 0.3, sodium: 56 },
  { name: '火腿肠', category: '速食', nameEn: 'Luncheon Meat Sausage', calories: 212, protein: 14.5, carbs: 8.5, fat: 13.5, sodium: 980 },
  { name: '香肠(猪肉)', category: '肉禽', nameEn: 'Chinese Pork Sausage', calories: 508, protein: 14.7, carbs: 21.2, fat: 40.7, sodium: 2310 },
  { name: '培根', category: '肉禽', nameEn: 'Bacon', calories: 400, protein: 13.6, carbs: 0.5, fat: 39.9, sodium: 576 },
  { name: '牛肉(肥瘦)', category: '肉禽', nameEn: 'Beef Mixed', calories: 125, protein: 19.9, carbs: 1.2, fat: 4.2, sodium: 84 },

  // ==================== 禽肉类 ====================
  { name: '鸡全腿(含皮)', category: '肉禽', nameEn: 'Whole Chicken Leg', calories: 181, protein: 16.0, carbs: 0, fat: 13.0 },
  { name: '鸡胸肉(炒)', category: '肉禽', nameEn: 'Stir-fried Chicken Breast', calories: 147, protein: 29.6, carbs: 1.8, fat: 2.5 },
  { name: '鸡爪', category: '肉禽', nameEn: 'Chicken Feet', calories: 254, protein: 23.9, carbs: 2.7, fat: 16.4, sodium: 169 },
  { name: '鸡肫(鸡胗)', category: '肉禽', nameEn: 'Chicken Gizzard', calories: 118, protein: 19.2, carbs: 4.0, fat: 2.8, sodium: 102 },
  { name: '鸡心', category: '肉禽', nameEn: 'Chicken Heart', calories: 172, protein: 15.9, carbs: 0.1, fat: 11.8 },
  { name: '鸭肝', category: '肉禽', nameEn: 'Duck Liver', calories: 129, protein: 14.5, carbs: 4.0, fat: 5.7 },
  { name: '鸭腿', category: '肉禽', nameEn: 'Duck Leg', calories: 240, protein: 14.8, carbs: 0, fat: 20.3 },
  { name: '鹅肉', category: '肉禽', nameEn: 'Goose Meat', calories: 251, protein: 17.9, carbs: 0, fat: 19.9 },
  { name: '火鸡胸肉', category: '肉禽', nameEn: 'Turkey Breast', calories: 111, protein: 23.1, carbs: 0, fat: 1.8, sodium: 60 },
  { name: '鸽子肉', category: '肉禽', nameEn: 'Pigeon Meat', calories: 201, protein: 16.5, carbs: 1.7, fat: 14.2 },
  { name: '鹌鹑肉', category: '肉禽', nameEn: 'Quail Meat', calories: 110, protein: 20.2, carbs: 0, fat: 3.1 },

  // ==================== 水产品 ====================
  { name: '草鱼', category: '水产', nameEn: 'Grass Carp', calories: 113, protein: 16.6, carbs: 0, fat: 5.2, sodium: 46 },
  { name: '鲫鱼', category: '水产', nameEn: 'Crucian Carp', calories: 108, protein: 17.1, carbs: 3.8, fat: 2.7, sodium: 41 },
  { name: '鲤鱼', category: '水产', nameEn: 'Common Carp', calories: 109, protein: 17.6, carbs: 0.5, fat: 4.1, sodium: 53 },
  { name: '鲢鱼', category: '水产', nameEn: 'Silver Carp', calories: 104, protein: 17.8, carbs: 0, fat: 3.6, sodium: 57 },
  { name: '鳜鱼', category: '水产', nameEn: 'Mandarin Fish', calories: 117, protein: 19.9, carbs: 0, fat: 4.2 },
  { name: '鲈鱼', category: '水产', nameEn: 'Sea Bass', calories: 105, protein: 18.6, carbs: 0, fat: 3.4, sodium: 144 },
  { name: '罗非鱼', category: '水产', nameEn: 'Tilapia', calories: 98, protein: 20.1, carbs: 0, fat: 1.7, sodium: 75 },
  { name: '黄花鱼(大)', category: '水产', nameEn: 'Large Yellow Croaker', calories: 97, protein: 17.7, carbs: 0, fat: 2.5, sodium: 120 },
  { name: '带鱼', category: '水产', nameEn: 'Hairtail Fish', calories: 127, protein: 17.7, carbs: 0, fat: 4.9, sodium: 150 },
  { name: '秋刀鱼', category: '水产', nameEn: 'Pacific Saury', calories: 318, protein: 17.6, carbs: 0.1, fat: 25.9, sodium: 78 },
  { name: '鲅鱼', category: '水产', nameEn: 'Spanish Mackerel', calories: 122, protein: 21.2, carbs: 3.1, fat: 3.1, sodium: 74 },
  { name: '沙丁鱼(罐头)', category: '水产', nameEn: 'Canned Sardine', calories: 208, protein: 19.3, carbs: 0.1, fat: 14.1, sodium: 400 },
  { name: '金枪鱼(罐头水浸)', category: '水产', nameEn: 'Canned Tuna in Water', calories: 116, protein: 26.0, carbs: 0, fat: 0.6, sodium: 317 },
  { name: '金枪鱼(罐头油浸)', category: '水产', nameEn: 'Canned Tuna in Oil', calories: 198, protein: 25.0, carbs: 0, fat: 10.0, sodium: 340 },
  { name: '龙虾', category: '水产', nameEn: 'Lobster', calories: 90, protein: 18.8, carbs: 0.5, fat: 0.9, sodium: 230 },
  { name: '基围虾', category: '水产', nameEn: 'Grass Shrimp', calories: 101, protein: 18.2, carbs: 2.7, fat: 1.4, sodium: 203 },
  { name: '小龙虾', category: '水产', nameEn: 'Crayfish', calories: 93, protein: 18.6, carbs: 0.5, fat: 1.3, sodium: 197 },
  { name: '河蟹', category: '水产', nameEn: 'River Crab', calories: 103, protein: 17.5, carbs: 2.3, fat: 2.6, sodium: 193 },
  { name: '梭子蟹', category: '水产', nameEn: 'Swimming Crab', calories: 95, protein: 15.9, carbs: 3.9, fat: 2.0, sodium: 260 },
  { name: '蛤蜊', category: '水产', nameEn: 'Clam', calories: 62, protein: 10.1, carbs: 2.8, fat: 1.1, sodium: 425 },
  { name: '扇贝(鲜)', category: '水产', nameEn: 'Scallop Fresh', calories: 60, protein: 11.1, carbs: 2.6, fat: 0.6, sodium: 339 },
  { name: '扇贝(干)', category: '水产', nameEn: 'Dried Scallop', calories: 264, protein: 55.6, carbs: 5.1, fat: 1.9, sodium: 855 },
  { name: '牡蛎(生蚝)', category: '水产', nameEn: 'Oyster', calories: 73, protein: 5.3, carbs: 8.2, fat: 2.1, sodium: 462 },
  { name: '鱿鱼(鲜)', category: '水产', nameEn: 'Squid Fresh', calories: 92, protein: 17.0, carbs: 0, fat: 1.6, sodium: 134 },
  { name: '鱿鱼(干)', category: '水产', nameEn: 'Dried Squid', calories: 313, protein: 60.0, carbs: 14.0, fat: 4.7, sodium: 1705 },
  { name: '章鱼', category: '水产', nameEn: 'Octopus', calories: 59, protein: 10.6, carbs: 4.4, fat: 0.5 },
  { name: '海参(水发)', category: '水产', nameEn: 'Rehydrated Sea Cucumber', calories: 78, protein: 16.5, carbs: 0.9, fat: 0.2, sodium: 502 },
  { name: '虾皮', category: '水产', nameEn: 'Dried Small Shrimp', calories: 153, protein: 30.7, carbs: 2.5, fat: 2.2, sodium: 5058 },

  // ==================== 蛋类 ====================
  { name: '鸡蛋(全蛋)', category: '蛋类', nameEn: 'Whole Egg', calories: 144, protein: 13.3, carbs: 2.8, fat: 8.8, sodium: 131 },
  { name: '鸡蛋白', category: '蛋类', nameEn: 'Egg White', calories: 60, protein: 11.6, carbs: 3.1, fat: 0.1, sodium: 79 },
  { name: '鸡蛋黄', category: '蛋类', nameEn: 'Egg Yolk', calories: 328, protein: 15.2, carbs: 3.4, fat: 28.2, sodium: 56 },
  { name: '鸭蛋(全蛋)', category: '蛋类', nameEn: 'Duck Egg', calories: 180, protein: 12.6, carbs: 3.1, fat: 13.0, sodium: 106 },
  { name: '皮蛋(松花蛋)', category: '蛋类', nameEn: 'Century Egg', calories: 171, protein: 14.2, carbs: 4.5, fat: 10.7, sodium: 542 },
  { name: '咸鸭蛋', category: '蛋类', nameEn: 'Salted Duck Egg', calories: 190, protein: 12.7, carbs: 6.3, fat: 13.1, sodium: 2706 },
  { name: '鹌鹑蛋', category: '蛋类', nameEn: 'Quail Egg', calories: 160, protein: 12.8, carbs: 2.1, fat: 11.1, sodium: 106 },
  { name: '鸡蛋(炒)', category: '蛋类', nameEn: 'Scrambled Egg', calories: 197, protein: 13.1, carbs: 2.5, fat: 15.5, sodium: 170 },

  // ==================== 奶制品 ====================
  { name: '全脂牛奶', category: '奶制品', nameEn: 'Whole Milk', calories: 54, protein: 3.0, carbs: 3.4, fat: 3.2, sugar: 3.4, sodium: 43 },
  { name: '脱脂牛奶', category: '奶制品', nameEn: 'Skim Milk', calories: 35, protein: 3.4, carbs: 5.0, fat: 0.1, sugar: 4.8, sodium: 52 },
  { name: '全脂奶粉', category: '奶制品', nameEn: 'Whole Milk Powder', calories: 478, protein: 20.1, carbs: 55.0, fat: 21.2, sugar: 38.4, sodium: 260 },
  { name: '脱脂奶粉', category: '奶制品', nameEn: 'Skim Milk Powder', calories: 357, protein: 35.5, carbs: 52.6, fat: 0.7, sugar: 47.0, sodium: 540 },
  { name: '淡奶油', category: '奶制品', nameEn: 'Heavy Cream', calories: 346, protein: 2.5, carbs: 2.9, fat: 36.0, sugar: 2.7, sodium: 52 },
  { name: '黄油', category: '油脂', nameEn: 'Butter', calories: 734, protein: 0.9, carbs: 0.9, fat: 78.0, sodium: 640 },
  { name: '酸奶(全脂)', category: '奶制品', nameEn: 'Full-fat Yogurt', calories: 72, protein: 2.5, carbs: 9.3, fat: 2.7, sugar: 9.0, sodium: 40 },
  { name: '希腊酸奶', category: '奶制品', nameEn: 'Greek Yogurt', calories: 97, protein: 9.0, carbs: 3.8, fat: 5.0, sugar: 3.7 },
  { name: '奶酪(切达)', category: '奶制品', nameEn: 'Cheddar Cheese', calories: 403, protein: 24.9, carbs: 1.3, fat: 33.1, sodium: 621 },
  { name: '马苏里拉奶酪', category: '奶制品', nameEn: 'Mozzarella Cheese', calories: 280, protein: 19.4, carbs: 2.2, fat: 22.4, sodium: 415 },
  { name: '奶油奶酪', category: '奶制品', nameEn: 'Cream Cheese', calories: 342, protein: 6.2, carbs: 4.1, fat: 34.4, sodium: 321 },
  { name: '炼乳(全脂甜)', category: '奶制品', nameEn: 'Sweetened Condensed Milk', calories: 328, protein: 7.0, carbs: 54.0, fat: 8.7, sugar: 54.0, sodium: 133 },
  { name: '羊奶', category: '奶制品', nameEn: 'Goat Milk', calories: 59, protein: 3.5, carbs: 4.3, fat: 3.5, sugar: 4.1, sodium: 34 },

  // ==================== 坚果及种子 ====================
  { name: '核桃', category: '坚果', nameEn: 'Walnut', calories: 627, protein: 14.9, carbs: 13.0, fat: 58.8, fiber: 9.5 },
  { name: '巴旦木(杏仁)', category: '坚果', nameEn: 'Almond', calories: 578, protein: 21.3, carbs: 20.4, fat: 49.9, fiber: 12.5 },
  { name: '腰果', category: '坚果', nameEn: 'Cashew', calories: 553, protein: 18.2, carbs: 30.2, fat: 43.8, fiber: 3.3, sodium: 16 },
  { name: '榛子', category: '坚果', nameEn: 'Hazelnut', calories: 601, protein: 13.4, carbs: 16.7, fat: 56.0, fiber: 9.7 },
  { name: '松子', category: '坚果', nameEn: 'Pine Nut', calories: 673, protein: 13.7, carbs: 13.0, fat: 63.7, fiber: 4.5 },
  { name: '开心果', category: '坚果', nameEn: 'Pistachio', calories: 601, protein: 20.6, carbs: 27.2, fat: 45.4, fiber: 10.6, sodium: 1 },
  { name: '葵花子', category: '坚果', nameEn: 'Sunflower Seed', calories: 597, protein: 23.9, carbs: 16.7, fat: 49.9, fiber: 6.1, sodium: 5 },
  { name: '南瓜子', category: '坚果', nameEn: 'Pumpkin Seed', calories: 574, protein: 33.2, carbs: 9.1, fat: 46.7, fiber: 3.9 },
  { name: '芝麻(黑)', category: '坚果', nameEn: 'Black Sesame', calories: 531, protein: 19.1, carbs: 15.6, fat: 46.1, fiber: 14.0 },
  { name: '芝麻(白)', category: '坚果', nameEn: 'White Sesame', calories: 536, protein: 18.4, carbs: 14.0, fat: 46.7, fiber: 9.8 },
  { name: '花生(炒)', category: '坚果', nameEn: 'Roasted Peanut', calories: 589, protein: 21.7, carbs: 21.3, fat: 48.0, fiber: 6.3, sodium: 4 },
  { name: '花生米(生)', category: '坚果', nameEn: 'Raw Peanut', calories: 563, protein: 24.8, carbs: 16.0, fat: 44.3, fiber: 5.5 },
  { name: '板栗(熟)', category: '坚果', nameEn: 'Cooked Chestnut', calories: 214, protein: 4.8, carbs: 46.0, fat: 1.5, fiber: 1.2 },
  { name: '亚麻籽', category: '坚果', nameEn: 'Flaxseed', calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3 },
  { name: '奇亚籽', category: '坚果', nameEn: 'Chia Seed', calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4 },

  // ==================== 食用油脂 ====================
  { name: '花生油', category: '油脂', nameEn: 'Peanut Oil', calories: 899, protein: 0, carbs: 0, fat: 99.9 },
  { name: '大豆油', category: '油脂', nameEn: 'Soybean Oil', calories: 899, protein: 0, carbs: 0, fat: 99.9 },
  { name: '菜籽油', category: '油脂', nameEn: 'Canola Oil', calories: 899, protein: 0, carbs: 0, fat: 99.9 },
  { name: '玉米油', category: '油脂', nameEn: 'Corn Oil', calories: 899, protein: 0, carbs: 0, fat: 99.9 },
  { name: '橄榄油', category: '油脂', nameEn: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100.0 },
  { name: '椰子油', category: '油脂', nameEn: 'Coconut Oil', calories: 892, protein: 0, carbs: 0, fat: 99.1 },
  { name: '芝麻油(香油)', category: '油脂', nameEn: 'Sesame Oil', calories: 898, protein: 0.2, carbs: 0, fat: 99.7 },
  { name: '葵花籽油', category: '油脂', nameEn: 'Sunflower Oil', calories: 900, protein: 0, carbs: 0, fat: 100.0 },
  { name: '猪油(板油)', category: '油脂', nameEn: 'Lard', calories: 879, protein: 0, carbs: 0.2, fat: 98.8 },
  { name: '亚麻籽油', category: '油脂', nameEn: 'Flaxseed Oil', calories: 900, protein: 0, carbs: 0, fat: 100.0 },

  // ==================== 调味品 ====================
  { name: '生抽酱油', category: '调味料', nameEn: 'Light Soy Sauce', calories: 63, protein: 5.4, carbs: 9.9, fat: 0.1, sodium: 5757 },
  { name: '老抽酱油', category: '调味料', nameEn: 'Dark Soy Sauce', calories: 104, protein: 7.5, carbs: 17.6, fat: 0.4, sodium: 5555 },
  { name: '蚝油', category: '调味料', nameEn: 'Oyster Sauce', calories: 112, protein: 4.2, carbs: 22.3, fat: 0.7, sodium: 2430 },
  { name: '白醋', category: '调味料', nameEn: 'White Vinegar', calories: 21, protein: 0.3, carbs: 4.9, fat: 0, sodium: 0 },
  { name: '陈醋', category: '调味料', nameEn: 'Mature Vinegar', calories: 114, protein: 2.5, carbs: 22.3, fat: 0.3, sodium: 262 },
  { name: '食盐', category: '调味料', nameEn: 'Salt', calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 38500 },
  { name: '白砂糖', category: '调味料', nameEn: 'White Sugar', calories: 400, protein: 0, carbs: 99.9, fat: 0, sugar: 99.9 },
  { name: '蜂蜜', category: '调味料', nameEn: 'Honey', calories: 321, protein: 0.4, carbs: 75.6, fat: 1.9, sugar: 82.1 },
  { name: '番茄酱', category: '调味料', nameEn: 'Ketchup', calories: 97, protein: 2.1, carbs: 23.0, fat: 0.2, sugar: 20.6, sodium: 730 },
  { name: '沙拉酱(蛋黄酱)', category: '调味料', nameEn: 'Mayonnaise', calories: 680, protein: 1.1, carbs: 2.9, fat: 74.6, sodium: 500 },
  { name: '味精', category: '调味料', nameEn: 'MSG', calories: 268, protein: 21.8, carbs: 42.1, fat: 0, sodium: 14880 },
  { name: '淀粉(土豆)', category: '调味料', nameEn: 'Potato Starch', calories: 337, protein: 0.4, carbs: 83.1, fat: 0.1 },
  { name: '花椒粉', category: '调味料', nameEn: 'Sichuan Pepper Powder', calories: 258, protein: 6.7, carbs: 53.2, fat: 8.9, sodium: 47 },
  { name: '辣椒粉', category: '调味料', nameEn: 'Chili Powder', calories: 282, protein: 13.6, carbs: 49.7, fat: 12.9, sodium: 35 },
  { name: '五香粉', category: '调味料', nameEn: 'Five Spice Powder', calories: 297, protein: 10.0, carbs: 62.5, fat: 7.0 },
  { name: '桂皮(肉桂)', category: '调味料', nameEn: 'Cinnamon', calories: 247, protein: 3.9, carbs: 80.6, fat: 1.2, fiber: 53.1 },

  // ==================== 饮品 ====================
  { name: '绿茶(茶汤)', category: '饮品', nameEn: 'Green Tea Infusion', calories: 3, protein: 0.3, carbs: 0.4, fat: 0, sodium: 1 },
  { name: '红茶(茶汤)', category: '饮品', nameEn: 'Black Tea Infusion', calories: 3, protein: 0.1, carbs: 0.6, fat: 0, sodium: 4 },
  { name: '黑咖啡(无糖)', category: '饮品', nameEn: 'Black Coffee Unsweetened', calories: 2, protein: 0.3, carbs: 0, fat: 0, sodium: 5 },
  { name: '速溶咖啡(三合一)', category: '饮品', nameEn: 'Instant Coffee 3in1', calories: 400, protein: 4.0, carbs: 72.0, fat: 10.0, sugar: 50.0, sodium: 200 },
  { name: '椰子水', category: '饮品', nameEn: 'Coconut Water', calories: 20, protein: 0.7, carbs: 3.7, fat: 0.2, sugar: 2.6 },
  { name: '豆浆(无糖)', category: '饮品', nameEn: 'Unsweetened Soy Milk', calories: 31, protein: 3.0, carbs: 1.2, fat: 1.6 },
  { name: '橙汁(鲜榨)', category: '饮品', nameEn: 'Fresh Orange Juice', calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, sugar: 8.4 },
  { name: '可乐', category: '饮品', nameEn: 'Cola', calories: 40, protein: 0, carbs: 10.7, fat: 0, sugar: 10.6, sodium: 11 },
  { name: '雪碧', category: '饮品', nameEn: 'Sprite', calories: 40, protein: 0, carbs: 10.6, fat: 0, sugar: 10.6, sodium: 11 },
  { name: '运动饮料(佳得乐)', category: '饮品', nameEn: 'Sports Drink Gatorade', calories: 25, protein: 0, carbs: 6.0, fat: 0, sugar: 5.0, sodium: 110 },
  { name: '牛奶(箱装全脂)', category: '饮品', nameEn: 'Whole Milk Box', calories: 66, protein: 3.2, carbs: 4.9, fat: 3.6, sugar: 4.8, sodium: 50 },
  { name: '低糖饮料(无糖可乐)', category: '饮品', nameEn: 'Diet Cola', calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 12 },
  { name: '番茄汁', category: '饮品', nameEn: 'Tomato Juice', calories: 17, protein: 0.9, carbs: 3.1, fat: 0.2, sugar: 2.6, sodium: 25 },
  { name: '苹果醋饮料', category: '饮品', nameEn: 'Apple Cider Vinegar Drink', calories: 22, protein: 0, carbs: 5.5, fat: 0, sugar: 5.0, sodium: 5 },

  // ==================== 速食及零食 ====================
  { name: '薯片', category: '速食', nameEn: 'Potato Chips', calories: 521, protein: 6.3, carbs: 54.2, fat: 31.6, fiber: 3.9, sodium: 578 },
  { name: '锅巴', category: '速食', nameEn: 'Rice Cracker', calories: 450, protein: 8.2, carbs: 67.0, fat: 17.3, sodium: 400 },
  { name: '爆米花', category: '速食', nameEn: 'Popcorn', calories: 387, protein: 12.9, carbs: 73.1, fat: 4.5, fiber: 14.5 },
  { name: '饼干(奥利奥)', category: '速食', nameEn: 'Oreo Cookie', calories: 480, protein: 4.8, carbs: 69.8, fat: 21.0, sugar: 39.5, sodium: 380 },
  { name: '巧克力(黑)', category: '速食', nameEn: 'Dark Chocolate', calories: 546, protein: 5.5, carbs: 59.4, fat: 31.3, fiber: 10.9, sugar: 47.5 },
  { name: '巧克力(牛奶)', category: '速食', nameEn: 'Milk Chocolate', calories: 535, protein: 7.7, carbs: 59.2, fat: 29.7, sugar: 52.9, sodium: 79 },
  { name: '冰淇淋(香草)', category: '速食', nameEn: 'Vanilla Ice Cream', calories: 207, protein: 3.5, carbs: 23.6, fat: 11.0, sugar: 21.0, sodium: 80 },
  { name: '汉堡包(牛肉)', category: '速食', nameEn: 'Beef Burger', calories: 295, protein: 17.0, carbs: 24.0, fat: 14.0, sodium: 490 },
  { name: '炸鸡腿', category: '速食', nameEn: 'Fried Chicken Leg', calories: 289, protein: 18.9, carbs: 14.4, fat: 16.5, sodium: 520 },
  { name: '比萨(奶酪)', category: '速食', nameEn: 'Cheese Pizza', calories: 266, protein: 11.4, carbs: 30.0, fat: 10.4, sodium: 600 },
  { name: '寿司(三文鱼)', category: '速食', nameEn: 'Salmon Sushi', calories: 143, protein: 7.0, carbs: 19.0, fat: 3.9, sodium: 370 },
  { name: '麻辣烫(均值)', category: '速食', nameEn: 'Mala Tang Average', calories: 82, protein: 4.2, carbs: 8.0, fat: 3.6, sodium: 650 },
  { name: '臭豆腐(炸)', category: '速食', nameEn: 'Fried Stinky Tofu', calories: 228, protein: 12.5, carbs: 8.0, fat: 16.0, sodium: 430 },
  { name: '卤蛋', category: '速食', nameEn: 'Marinated Egg', calories: 145, protein: 12.0, carbs: 3.3, fat: 9.0, sodium: 410 },
  { name: '牛肉干(五香)', category: '速食', nameEn: 'Five Spice Beef Jerky', calories: 350, protein: 45.6, carbs: 12.0, fat: 10.0, sodium: 1500 },
  { name: '锅贴(猪肉)', category: '速食', nameEn: 'Pot Sticker Pork', calories: 230, protein: 7.8, carbs: 28.0, fat: 9.5, sodium: 560 },

  // ==================== 蛋白类补剂 ====================
  { name: '乳清蛋白粉', category: '豆制品', nameEn: 'Whey Protein Powder', calories: 370, protein: 80.0, carbs: 6.0, fat: 3.5, sugar: 4.0, sodium: 200 },
  { name: '酪蛋白粉', category: '豆制品', nameEn: 'Casein Protein Powder', calories: 365, protein: 78.0, carbs: 8.0, fat: 2.5, sugar: 2.0, sodium: 420 },
  { name: '大豆蛋白粉', category: '豆制品', nameEn: 'Soy Protein Isolate', calories: 338, protein: 80.0, carbs: 6.0, fat: 2.0, sodium: 800 },
];

async function main() {
  console.log('⬇️  开始导入中国食物成分表数据...');

  const existing = await prisma.food.findMany({
    where: { isCustom: false },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((f) => f.name.toLowerCase()));
  console.log(`📦 现有系统食物: ${existingNames.size} 条`);

  const newFoods = foods
    .filter((f) => !existingNames.has(f.name.toLowerCase()))
    .map((f) => ({
      name: f.name,
      nameEn: f.nameEn ?? null,
      category: f.category,
      servingUnit: 'g',
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      fiber: f.fiber ?? null,
      sugar: f.sugar ?? null,
      sodium: f.sodium ?? null,
      source: 'seed',
      isCustom: false,
      userId: null,
    }));

  if (newFoods.length > 0) {
    const result = await prisma.food.createMany({ data: newFoods });
    console.log(`✅ 新增: ${result.count} 条`);
  } else {
    console.log('✅ 无新增（全部已存在）');
  }

  const total = await prisma.food.count({ where: { isCustom: false } });
  console.log(`📊 数据库系统食物合计: ${total} 条`);
}

main()
  .catch((e) => { console.error('❌ 导入失败:', e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
