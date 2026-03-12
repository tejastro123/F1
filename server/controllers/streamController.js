import { AccessToken } from 'livekit-server-sdk';
import crypto from 'crypto';

/**
 * Endpoint: POST /api/v1/stream/token
 * Generate a JWT for joining the LiveKit room.
 */
export const getToken = async (req, res, next) => {
  try {
    const { roomName = 'f1-live-stream', role = 'viewer', participantName } = req.body;

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ 
        message: 'LiveKit API keys are not configured on the server. Please add them to .env' 
      });
    }

    // Generate a unique ID if name isn't provided
    const identity = participantName || `${role}-${crypto.randomBytes(4).toString('hex')}`;

    console.log(`Generating LiveKit token for ${identity} in room ${roomName} as ${role}`);

    const at = new AccessToken(apiKey, apiSecret, {
      identity: identity,
      name: identity,
      ttl: 3600, // 1 hour token
    });

    // Determine specific permissions
    if (role === 'admin') {
      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true, // For chat messages
      });
    } else {
      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: false,
        canSubscribe: true,
        canPublishData: true, // For chat messages
      });
    }

    const token = await at.toJwt();

    res.json({ token, identity });
  } catch (error) {
    next(error);
  }
};
