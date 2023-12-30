const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const getDailyDataArray = async () => {
    //weekly data
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7);
  
    const dailyOrders = await Order.aggregate([
      {
        $match: {
          "paymentStatus": "Success" ,
          orderDate: { $gte: sevenDaysAgo, $lte: currentDate },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$orderDate" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
  
    const dailyDataArray = [];
    for (let i = 6; i >= 0; i--) {
      const dayIndex = new Date(currentDate);
      dayIndex.setDate(currentDate.getDate() - i);
      const foundDay = dailyOrders.find(
        (order) => order._id === (dayIndex.getDay() === 0 ? 7 : dayIndex.getDay())
      );
      const count = foundDay ? foundDay.count : 0;
      const dayNameIndex = dayIndex.getDay() === 0 ? 6 : dayIndex.getDay() - 1;
      const dayName = dayNames[dayNameIndex];
      dailyDataArray.push({ day: dayName, count });
    }
    return dailyDataArray;
  };
  
  const getMonthlyDataArray = async () => {
    //Monthly Data
    const currentDate = new Date();
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 12);
  
    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          "paymentStatus": "Success" ,
          orderDate: { $gte: sevenMonthsAgo, $lte: currentDate },
        },
      },
      {
        $group: {
          _id: { $month: "$orderDate" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

  
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
  
    const monthlyDataArray = [];
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentDate.getMonth() - i + 12) % 12;
      const foundMonth = monthlyOrders.find(
        (order) => order._id === monthIndex + 1
      );
      const count = foundMonth ? foundMonth.count : 0;
      const monthName = monthNames[monthIndex];
      monthlyDataArray.push({ month: monthName, count });
    }
  
    return monthlyDataArray;
  };
  
  //Yearly data
  const getYearlyDataArray = async () => {
    const currentDate = new Date();
    const sevenYearsAgo = new Date(currentDate);
    sevenYearsAgo.setFullYear(currentDate.getFullYear() - 7);
  
    const yearlyOrders = await Order.aggregate([
      {
        $match: {
          "paymentStatus": "Success" ,
          orderDate: { $gte: sevenYearsAgo, $lte: currentDate },
        },
      },
      {
        $group: {
          _id: { $year: "$orderDate" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
  console.log(yearlyOrders,"yearlyOrders");
    const yearlyDataArray = [];
    for (let i = 6; i >= 0; i--) {
      const year = currentDate.getFullYear() - i;
  console.log(year);
      const foundYear = yearlyOrders.find((order) => order._id === year);
      const count = foundYear ? foundYear.count : 0;
      yearlyDataArray.push({ year, count });
    }
  
    return yearlyDataArray;
  };

  const getCategoryWiseDataArray = async () => {
    const currentDate = new Date();
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 12);
  
    // Fetch unique category names from the Product collection
    const uniqueCategories = await Category.distinct("name");
  
    const categoryWiseOrders = await Order.aggregate([
      {
        $match: {
          "paymentStatus": "Success",
          orderDate: { $gte: sevenMonthsAgo, $lte: currentDate },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $unwind: "$productInfo",
      },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $unwind: "$categoryInfo",
      },
      {
        $group: {
          _id: "$categoryInfo.name",
          count: { $sum: "$items.quantity" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
  
    // Ensure that all categories are present in the result, even if there are no sales for a category.
    const categoryDataArray = uniqueCategories.map(category => ({
      category,
      count: 0,
    }));
  
    // Update counts based on the actual data
    categoryWiseOrders.forEach(category => {
      const index = uniqueCategories.indexOf(category._id);
      if (index !== -1) {
        categoryDataArray[index].count = category.count;
      }
    });
  
    return { categoryNames: uniqueCategories, categoryDataArray };
  };
  
  
  module.exports = {
    getDailyDataArray,
    getYearlyDataArray,
    getMonthlyDataArray,
    getCategoryWiseDataArray,
  };
  