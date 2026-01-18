import Table from '../models/table.model.js';
import Restaurant from '../models/restaurant.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../config/logger.js';

/**
 * @desc    Get all tables for a restaurant
 * @route   GET /api/v1/restaurants/:restaurantId/tables
 * @access  Private
 */
export const getTables = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const userId = req.user.id;

  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: userId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  const tables = await Table.find({ restaurant: restaurantId }).sort({ number: 1 });

  ApiResponse.success({ tables, restaurant: { slug: restaurant.slug, name: restaurant.name } }).send(res);
});

/**
 * @desc    Create table
 * @route   POST /api/v1/restaurants/:restaurantId/tables
 * @access  Private
 */
export const createTable = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const userId = req.user.id;

  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: userId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  // Check if table number exists
  const existingTable = await Table.findOne({
    restaurant: restaurantId,
    number: req.body.number,
  });
  if (existingTable) {
    throw ApiError.conflict(`Table ${req.body.number} already exists`);
  }

  const table = await Table.create({
    ...req.body,
    restaurant: restaurantId,
  });

  logger.info(`Table created: ${table.name} for restaurant ${restaurant.name}`);

  ApiResponse.created(table, 'Table created successfully').send(res);
});

/**
 * @desc    Create multiple tables
 * @route   POST /api/v1/restaurants/:restaurantId/tables/bulk
 * @access  Private
 */
export const createBulkTables = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { startNumber, endNumber, prefix = 'Table', location = 'indoor' } = req.body;
  const userId = req.user.id;

  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: userId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  const tables = [];
  for (let i = startNumber; i <= endNumber; i++) {
    const existingTable = await Table.findOne({ restaurant: restaurantId, number: i });
    if (!existingTable) {
      tables.push({
        restaurant: restaurantId,
        name: `${prefix} ${i}`,
        number: i,
        location,
      });
    }
  }

  if (tables.length === 0) {
    throw ApiError.badRequest('All table numbers already exist');
  }

  const createdTables = await Table.insertMany(tables);

  ApiResponse.created({ tables: createdTables, count: createdTables.length }, `${createdTables.length} tables created`).send(res);
});

/**
 * @desc    Update table
 * @route   PUT /api/v1/restaurants/:restaurantId/tables/:tableId
 * @access  Private
 */
export const updateTable = asyncHandler(async (req, res) => {
  const { restaurantId, tableId } = req.params;
  const userId = req.user.id;

  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: userId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  let table = await Table.findOne({ _id: tableId, restaurant: restaurantId });
  if (!table) {
    throw ApiError.notFound('Table not found');
  }

  // Check for duplicate number
  if (req.body.number && req.body.number !== table.number) {
    const existingTable = await Table.findOne({
      restaurant: restaurantId,
      number: req.body.number,
      _id: { $ne: tableId },
    });
    if (existingTable) {
      throw ApiError.conflict(`Table ${req.body.number} already exists`);
    }
  }

  table = await Table.findByIdAndUpdate(tableId, req.body, { new: true, runValidators: true });

  ApiResponse.success(table, 'Table updated successfully').send(res);
});

/**
 * @desc    Update table QR settings
 * @route   PATCH /api/v1/restaurants/:restaurantId/tables/:tableId/qr-settings
 * @access  Private
 */
export const updateQRSettings = asyncHandler(async (req, res) => {
  const { restaurantId, tableId } = req.params;
  const userId = req.user.id;

  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: userId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  const table = await Table.findOneAndUpdate(
    { _id: tableId, restaurant: restaurantId },
    { qrSettings: req.body },
    { new: true }
  );

  if (!table) {
    throw ApiError.notFound('Table not found');
  }

  ApiResponse.success(table, 'QR settings updated').send(res);
});

/**
 * @desc    Delete table
 * @route   DELETE /api/v1/restaurants/:restaurantId/tables/:tableId
 * @access  Private
 */
export const deleteTable = asyncHandler(async (req, res) => {
  const { restaurantId, tableId } = req.params;
  const userId = req.user.id;

  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: userId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  const table = await Table.findOneAndDelete({ _id: tableId, restaurant: restaurantId });
  if (!table) {
    throw ApiError.notFound('Table not found');
  }

  ApiResponse.success(null, 'Table deleted successfully').send(res);
});

/**
 * @desc    Delete multiple tables
 * @route   DELETE /api/v1/restaurants/:restaurantId/tables
 * @access  Private
 */
export const deleteBulkTables = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { tableIds } = req.body;
  const userId = req.user.id;

  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: userId });
  if (!restaurant) {
    throw ApiError.notFound('Restaurant not found');
  }

  const result = await Table.deleteMany({
    _id: { $in: tableIds },
    restaurant: restaurantId,
  });

  ApiResponse.success({ deletedCount: result.deletedCount }, `${result.deletedCount} tables deleted`).send(res);
});