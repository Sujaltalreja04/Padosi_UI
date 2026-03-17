import { useState, useEffect, useCallback, useRef } from 'react';
import { getDistanceToAddress } from '@/lib/distance';

interface AgentDistance {
  distanceKm: number;
  travelTimeMin: number;
}

interface UseAgentDistancesResult {
  distances: Record<string, AgentDistance>;
  isLoading: boolean;
}

/**
 * Hook to calculate distances from user location to multiple agent locations
 * Implements rate limiting to respect Nominatim API limits (1 req/sec)
 */
export function useAgentDistances(
  userLocation: { latitude: number; longitude: number } | null,
  agents: Array<{ id: string; location: string }>
): UseAgentDistancesResult {
  const [distances, setDistances] = useState<Record<string, AgentDistance>>({});
  const [isLoading, setIsLoading] = useState(false);
  const processedRef = useRef<Set<string>>(new Set());

  const calculateDistances = useCallback(async () => {
    if (!userLocation || agents.length === 0) return;

    setIsLoading(true);

    // Filter agents we haven't processed yet
    const unprocessedAgents = agents.filter(
      agent => !processedRef.current.has(agent.id)
    );

    // Process agents one at a time with delay to respect rate limits
    for (const agent of unprocessedAgents) {
      if (processedRef.current.has(agent.id)) continue;
      
      try {
        const result = await getDistanceToAddress(
          userLocation.latitude,
          userLocation.longitude,
          agent.location
        );

        if (result) {
          setDistances(prev => ({
            ...prev,
            [agent.id]: result,
          }));
        }

        processedRef.current.add(agent.id);

        // Delay between requests to respect Nominatim rate limit
        if (unprocessedAgents.indexOf(agent) < unprocessedAgents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1100));
        }
      } catch (error) {
        console.warn(`Failed to get distance for agent ${agent.id}:`, error);
        processedRef.current.add(agent.id);
      }
    }

    setIsLoading(false);
  }, [userLocation, agents]);

  useEffect(() => {
    calculateDistances();
  }, [calculateDistances]);

  return { distances, isLoading };
}
