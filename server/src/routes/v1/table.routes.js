import express from 'express';
import {
  getTables,
  createTable,
  createBulkTables,
  updateTable,
  updateQRSettings,
  deleteTable,
  deleteBulkTables,
} from '../../controllers/table.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
  .get(getTables)
  .post(createTable)
  .delete(deleteBulkTables);

router.post('/bulk', createBulkTables);

router.route('/:tableId')
  .put(updateTable)
  .delete(deleteTable);

router.patch('/:tableId/qr-settings', updateQRSettings);

export default router;