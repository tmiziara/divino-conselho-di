let subscriptionData: any = null;
let subscriptionPromise: Promise<any> | null = null;

export function getSubscription(userId: string, fetcher: () => Promise<any>) {
  if (subscriptionData && subscriptionData.userId === userId) {
    return Promise.resolve(subscriptionData.data);
  }
  if (!subscriptionPromise) {
    subscriptionPromise = fetcher().then(data => {
      subscriptionData = { userId, data };
      return data;
    });
  }
  return subscriptionPromise;
}

export function clearSubscriptionCache() {
  subscriptionData = null;
  subscriptionPromise = null;
} 