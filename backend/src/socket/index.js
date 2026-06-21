import { SessionManager } from "../queue/sessionManager.js";
import { getOrCreateQueue, processNextInQueue, triggerAgentRequest } from "../queue/speechQueue.js";

export function initSocket(io) {
    io.on("connection", (socket) =>{
        
        console.log("Socket connected: " + socket.id);

        socket.on("session:join", async ({sessionId}) => {
            socket.join(sessionId);
            const session = new SessionManager(sessionId);
            const exists = await session.exist();
            if (!exists) {
                socket.emit("error", {message: "Session not found"});
                return;
            }

            const [meta, agents, queue, history, speaking] = await Promise.all([
                session.getMeta(),
                session.getAgents(),
                session.getQueue(),
                session.getHistory(),
                session.getSpeaking()
            ]);

            socket.emit("session:state", {
                meta,
                agents: agents.map(a => ({id: a.id, displayName: a.displayName, colorSeed: a.colorSeed, joinedAt: a.joinedAt})),
                queue,
                history,
                speaking
                });
            });

        socket.on("session:start", async ({sessionId}) => {
            const session = new SessionManager(sessionId);
            await session.updateMeta({status: "active"});
            io.to(sessionId).emit("session:started");

            await triggerAgentRequest(sessionId, io);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected: " + socket.id);
            
        });

    });
}