type UpdateFn = () => void;
type Batch = {
  updates: UpdateFn[];
  isBatching: boolean;
};

const batch: Batch = {
  updates: [],
  isBatching: false,
};

export function batchUpdates(updateFn: UpdateFn): void {
  if (batch.isBatching) {
    batch.updates.push(updateFn);
    return;
  }

  batch.isBatching = true;
  try {
    updateFn();
    while (batch.updates.length > 0) {
      const nextUpdate = batch.updates.shift();
      if (nextUpdate) {
        nextUpdate();
      }
    }
  } finally {
    batch.isBatching = false;
    batch.updates = [];
  }
}

export function scheduleUpdate(updateFn: UpdateFn): void {
  if (batch.isBatching) {
    batch.updates.push(updateFn);
  } else {
    updateFn();
  }
} 