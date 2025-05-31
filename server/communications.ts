import { Router, Request, Response } from 'express';
import { pool, db } from './db';
import { communications } from '@shared/schema';

// Create a router to handle communication-related routes
const router = Router();

// Get all communications (for global view)
router.get('/api/communications', async (req: Request, res: Response) => {
  try {
    // Query to get all communications with client names and their action items and attachments
    const { rows: communications } = await pool.query(`
      SELECT c.*, 
        cl.full_name as client_name,
        cl.initials as client_initials,
        cl.tier as client_tier,
        (SELECT COUNT(*) FROM communication_action_items cai WHERE cai.communication_id = c.id) as action_item_count,
        (SELECT COUNT(*) FROM communication_attachments ca WHERE ca.communication_id = c.id) as attachment_count
      FROM communications c
      JOIN clients cl ON c.client_id = cl.id
      ORDER BY c.start_time DESC
    `);
    
    res.json(communications);
  } catch (error) {
    console.error('Error fetching all communications:', error);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

// Get all communications for a specific client
router.get('/api/communications/:clientId', async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.clientId);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }
    
    // Query to get communications with their action items and attachments
    const { rows: communications } = await pool.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM communication_action_items cai WHERE cai.communication_id = c.id) as action_item_count,
        (SELECT COUNT(*) FROM communication_attachments ca WHERE ca.communication_id = c.id) as attachment_count
      FROM communications c
      WHERE c.client_id = $1
      ORDER BY c.start_time DESC
    `, [clientId]);
    
    res.json(communications);
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

// Get client communication preferences
router.get('/api/communications/preferences/:clientId', async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.clientId);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }
    
    const { rows } = await pool.query(`
      SELECT * FROM client_communication_preferences
      WHERE client_id = $1
    `, [clientId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Communication preferences not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching communication preferences:', error);
    res.status(500).json({ error: 'Failed to fetch communication preferences' });
  }
});

// Get communication action items
router.get('/api/communications/:communicationId/action-items', async (req: Request, res: Response) => {
  try {
    const communicationId = parseInt(req.params.communicationId);
    
    if (isNaN(communicationId)) {
      return res.status(400).json({ error: 'Invalid communication ID' });
    }
    
    const { rows } = await pool.query(`
      SELECT * FROM communication_action_items
      WHERE communication_id = $1
      ORDER BY due_date ASC
    `, [communicationId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching communication action items:', error);
    res.status(500).json({ error: 'Failed to fetch communication action items' });
  }
});

// Get communication attachments
router.get('/api/communications/:communicationId/attachments', async (req: Request, res: Response) => {
  try {
    const communicationId = parseInt(req.params.communicationId);
    
    if (isNaN(communicationId)) {
      return res.status(400).json({ error: 'Invalid communication ID' });
    }
    
    const { rows } = await pool.query(`
      SELECT * FROM communication_attachments
      WHERE communication_id = $1
    `, [communicationId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching communication attachments:', error);
    res.status(500).json({ error: 'Failed to fetch communication attachments' });
  }
});

// Get communication templates
router.get('/api/communication-templates', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM communication_templates
      WHERE is_active = true
      ORDER BY category, name
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching communication templates:', error);
    res.status(500).json({ error: 'Failed to fetch communication templates' });
  }
});

// Get communication templates by category
router.get('/api/communication-templates/category/:category', async (req: Request, res: Response) => {
  try {
    const category = req.params.category;
    
    const { rows } = await pool.query(`
      SELECT * FROM communication_templates
      WHERE category = $1 AND is_active = true
      ORDER BY name
    `, [category]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching communication templates by category:', error);
    res.status(500).json({ error: 'Failed to fetch communication templates' });
  }
});

// Create a new communication
router.post('/api/communications', async (req: Request, res: Response) => {
  try {
    const {
      clientId,
      initiatedBy,
      startTime,
      endTime,
      duration,
      communicationType,
      channel,
      direction,
      subject,
      summary,
      details,
      sentiment,
      tags,
      followupRequired,
      hasAttachments,
      status
    } = req.body;
    
    if (!clientId || !initiatedBy || !startTime || !communicationType || !direction) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Insert using raw SQL to match actual database schema
    const { rows } = await pool.query(`
      INSERT INTO communications (
        client_id, initiated_by, start_time, end_time, duration,
        communication_type, channel, direction, subject, summary,
        notes, sentiment, tags, follow_up_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      clientId, initiatedBy, startTime, endTime, duration,
      communicationType, channel, direction, subject || '', summary || '',
      details || null, sentiment || 'neutral', tags || [], followupRequired || false
    ]);
    
    const newCommunication = rows[0];
    
    res.json(newCommunication);
  } catch (error) {
    console.error('Error creating communication:', error);
    res.status(500).json({ error: 'Failed to create communication' });
  }
});

// Update client communication preferences
router.put('/api/communications/preferences/:clientId', async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.clientId);
    
    if (isNaN(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }
    
    const {
      preferredChannels,
      preferredFrequency,
      preferredDays,
      preferredTimeSlots,
      preferredLanguage,
      optInMarketing,
      doNotContact
    } = req.body;
    
    // Check if preferences exist for this client
    const { rows: existingRows } = await pool.query(
      'SELECT * FROM client_communication_preferences WHERE client_id = $1',
      [clientId]
    );
    
    if (existingRows.length === 0) {
      // Insert new preferences
      const { rows } = await pool.query(`
        INSERT INTO client_communication_preferences
        (client_id, preferred_channels, preferred_frequency, preferred_days, 
         preferred_time_slots, preferred_language, opt_in_marketing, do_not_contact, last_updated)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *
      `, [
        clientId,
        preferredChannels || [],
        preferredFrequency || 'monthly',
        preferredDays || [],
        preferredTimeSlots || [],
        preferredLanguage || 'English',
        optInMarketing === undefined ? true : optInMarketing,
        doNotContact === undefined ? false : doNotContact
      ]);
      
      return res.json(rows[0]);
    } else {
      // Update existing preferences
      const { rows } = await pool.query(`
        UPDATE client_communication_preferences
        SET 
          preferred_channels = $2,
          preferred_frequency = $3,
          preferred_days = $4,
          preferred_time_slots = $5,
          preferred_language = $6,
          opt_in_marketing = $7,
          do_not_contact = $8,
          last_updated = NOW()
        WHERE client_id = $1
        RETURNING *
      `, [
        clientId,
        preferredChannels || existingRows[0].preferred_channels,
        preferredFrequency || existingRows[0].preferred_frequency,
        preferredDays || existingRows[0].preferred_days,
        preferredTimeSlots || existingRows[0].preferred_time_slots,
        preferredLanguage || existingRows[0].preferred_language,
        optInMarketing === undefined ? existingRows[0].opt_in_marketing : optInMarketing,
        doNotContact === undefined ? existingRows[0].do_not_contact : doNotContact
      ]);
      
      return res.json(rows[0]);
    }
  } catch (error) {
    console.error('Error updating communication preferences:', error);
    res.status(500).json({ error: 'Failed to update communication preferences' });
  }
});

// Create a new action item for a communication
router.post('/api/communications/:communicationId/action-items', async (req: Request, res: Response) => {
  try {
    const communicationId = parseInt(req.params.communicationId);
    
    if (isNaN(communicationId)) {
      return res.status(400).json({ error: 'Invalid communication ID' });
    }
    
    const { title, description, assignedTo, dueDate, priority, status } = req.body;
    
    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const { rows } = await pool.query(`
      INSERT INTO communication_action_items
      (communication_id, title, description, assigned_to, due_date, priority, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      communicationId,
      title,
      description || null,
      assignedTo,
      dueDate,
      priority || 'medium',
      status || 'pending'
    ]);
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating action item:', error);
    res.status(500).json({ error: 'Failed to create action item' });
  }
});

// Update action item status
router.put('/api/action-items/:actionItemId', async (req: Request, res: Response) => {
  try {
    const actionItemId = parseInt(req.params.actionItemId);
    
    if (isNaN(actionItemId)) {
      return res.status(400).json({ error: 'Invalid action item ID' });
    }
    
    const { status, completedAt } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const { rows } = await pool.query(`
      UPDATE communication_action_items
      SET status = $2, completed_at = $3
      WHERE id = $1
      RETURNING *
    `, [
      actionItemId,
      status,
      status === 'completed' ? (completedAt || new Date()) : null
    ]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Action item not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating action item:', error);
    res.status(500).json({ error: 'Failed to update action item' });
  }
});

// Get communication stats for a relationship manager
router.get('/api/communications/stats/rm/:rmId', async (req: Request, res: Response) => {
  try {
    const rmId = parseInt(req.params.rmId);
    
    if (isNaN(rmId)) {
      return res.status(400).json({ error: 'Invalid RM ID' });
    }
    
    // Get communication counts by type
    const { rows: typeCounts } = await pool.query(`
      SELECT communication_type, COUNT(*) as count
      FROM communications
      WHERE initiated_by = $1
      GROUP BY communication_type
    `, [rmId]);
    
    // Get communication counts by channel
    const { rows: channelCounts } = await pool.query(`
      SELECT channel, COUNT(*) as count
      FROM communications
      WHERE initiated_by = $1
      GROUP BY channel
    `, [rmId]);
    
    // Get communication counts by month
    const { rows: monthlyCounts } = await pool.query(`
      SELECT 
        EXTRACT(YEAR FROM start_time) as year,
        EXTRACT(MONTH FROM start_time) as month,
        COUNT(*) as count
      FROM communications
      WHERE initiated_by = $1
      GROUP BY EXTRACT(YEAR FROM start_time), EXTRACT(MONTH FROM start_time)
      ORDER BY year, month
    `, [rmId]);
    
    // Get total action items and pending action items
    const { rows: actionItemStats } = await pool.query(`
      SELECT
        COUNT(*) as total_action_items,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_action_items,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_action_items
      FROM communication_action_items cai
      JOIN communications c ON cai.communication_id = c.id
      WHERE c.initiated_by = $1
    `, [rmId]);
    
    res.json({
      communicationsByType: typeCounts,
      communicationsByChannel: channelCounts,
      communicationsByMonth: monthlyCounts,
      actionItems: actionItemStats.length > 0 ? actionItemStats[0] : {
        total_action_items: 0,
        pending_action_items: 0,
        completed_action_items: 0
      }
    });
  } catch (error) {
    console.error('Error fetching communication stats:', error);
    res.status(500).json({ error: 'Failed to fetch communication stats' });
  }
});

// Get deal closure action items (for Expected Closures dashboard)
router.get('/api/action-items/deal-closures', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT cai.*, c.client_id, cl.full_name as client_name, cl.initials as client_initials
      FROM communication_action_items cai
      JOIN communications c ON cai.communication_id = c.id
      JOIN clients cl ON c.client_id = cl.id
      WHERE cai.action_type = 'deal_closure' 
        AND cai.status = 'pending'
        AND cai.deal_value > 0
      ORDER BY cai.expected_close_date ASC, cai.deal_value DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching deal closure action items:', error);
    res.status(500).json({ error: 'Failed to fetch deal closure action items' });
  }
});

// Export the router
export default router;