import express from 'express';
import { v4 as uuid } from 'uuid';
import { SessionManager } from '../queue/sessionManager.js';

const router = express.router();

router.post('/create', async (req, res) => {
    try {
        const sessionId = uuid();
        const session = new SessionManager(sessionId);
        const meta = await session.create();

        const agentCount = Math.min(parseInt(req.body.agentCount) || 5, 20);
        const agents = [];

        for (let i = 0 ; i < agentCount ; i++) {
            const agent = await session.addAgent();
            agents.push({id: agent.id, displayName: agent.displayName, colorSeed: agent.colorSeed});
        }
        res.status(200).json({ sessionId, meta, agents });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
})

router.get('/:sessionId', async (req, res) => {
    try {
        const session = new SessionManager(req.params.sessionId);
        const meta = await session.getMeta();
        if (!meta) return res.status(404).json({error: 'Session not found'});

        const [agents, queue, history] = await Promise.all([
            session.getAgents(), session.getQueue(), session.getHistory()
        ]);
        res.status(200).json({
            meta, 
            agents: agents.map(a => ({id: a.id, displayName: a.displayName, colorSeed: a.colorSeed})),
            queueLength: queue.length,
            totalMessages: history.length,
        });
    } catch(err) {
        res.status(500).json({error: err.message});
    }
})

export default router;