import { OrderStateMachine } from './order-state-machine';

describe('OrderStateMachine', () => {
  const sm = new OrderStateMachine();

  it('allows valid transitions', () => {
    expect(sm.canTransition('pending', 'supplier_review')).toBe(true);
    expect(sm.canTransition('accepted', 'filling')).toBe(true);
    expect(sm.canTransition('delivered', 'payment_pending')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(sm.canTransition('pending', 'completed')).toBe(false);
    expect(sm.canTransition('completed', 'pending')).toBe(false);
    expect(sm.canTransition('cancelled', 'accepted')).toBe(false);
  });
});
