import 'dart:async';
import 'dart:collection';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Queues API actions when offline and replays when connectivity returns.
class OfflineAction {
  OfflineAction({required this.label, required this.execute});

  final String label;
  final Future<void> Function() execute;
}

class OfflineQueueNotifier extends StateNotifier<Queue<OfflineAction>> {
  OfflineQueueNotifier() : super(Queue()) {
    _listenConnectivity();
  }

  StreamSubscription<List<ConnectivityResult>>? _sub;

  void _listenConnectivity() {
    _sub = Connectivity().onConnectivityChanged.listen((results) {
      final online = results.any((r) => r != ConnectivityResult.none);
      if (online) flush();
    });
  }

  void enqueue(OfflineAction action) {
    state.add(action);
    state = Queue.from(state);
  }

  Future<void> flush() async {
    while (state.isNotEmpty) {
      final action = state.removeFirst();
      try {
        await action.execute();
      } catch (_) {
        state.addFirst(action);
        break;
      }
    }
    state = Queue.from(state);
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}

final offlineQueueProvider =
    StateNotifierProvider<OfflineQueueNotifier, Queue<OfflineAction>>(
  (ref) => OfflineQueueNotifier(),
);
