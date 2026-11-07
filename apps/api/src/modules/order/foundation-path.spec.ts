import { OrderStateMachine } from './order-state-machine';

/**
 * Contract test for the Foundation vertical slice status walk:
 * pending → … → completed (cash/card).
 */
describe('Foundation order status path', () => {
  const sm = new OrderStateMachine();

  const cashPath: Array<[Parameters<OrderStateMachine['canTransition']>[0], Parameters<OrderStateMachine['canTransition']>[1]]> = [
    ['pending', 'supplier_review'],
    ['supplier_review', 'dispatching'],
    ['dispatching', 'driver_offered'],
    ['driver_offered', 'accepted'],
    ['accepted', 'filling'],
    ['filling', 'in_transit'],
    ['in_transit', 'delivered'],
    ['delivered', 'payment_pending'],
    ['payment_pending', 'completed'],
  ];

  it.each(cashPath)('allows %s → %s', (from, to) => {
    expect(sm.canTransition(from, to)).toBe(true);
  });

  it('does not allow POD jump accepted → delivered', () => {
    expect(sm.canTransition('accepted', 'delivered')).toBe(false);
  });
});
