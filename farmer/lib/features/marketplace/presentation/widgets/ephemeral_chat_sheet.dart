import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../../../../core/network/network_client.dart';
import '../../../../core/storage/session_storage.dart';

class EphemeralChatSheet extends StatefulWidget {
  const EphemeralChatSheet({
    required this.receiverId,
    required this.productId,
    required this.productTitle,
    super.key,
  });

  final String receiverId;
  final String productId;
  final String productTitle;

  @override
  State<EphemeralChatSheet> createState() => _EphemeralChatSheetState();
}

class _EphemeralChatSheetState extends State<EphemeralChatSheet> {
  final _controller = TextEditingController();
  final _messages = <Map<String, dynamic>>[];
  io.Socket? _socket;
  Timer? _cooldownTimer;
  bool _connected = false;
  int _cooldownSeconds = 0;
  String? _currentUserId;
  String? _error;

  @override
  void initState() {
    super.initState();
    _connect();
  }

  Future<void> _connect() async {
    final token = await GetIt.I<SessionStorage>().getToken();
    if (token == null || token.isEmpty) {
      if (mounted) setState(() => _error = 'Please sign in to chat.');
      return;
    }

    final socket = io.io(
      '${DioHelper.socketBaseUrl}/marketplace-chat',
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .enableReconnection()
          .build(),
    );
    socket.onConnect((_) {
      if (mounted) setState(() => _connected = true);
    });
    socket.onDisconnect((_) {
      if (mounted) setState(() => _connected = false);
    });
    socket.on('chat:ready', (dynamic data) {
      final ready = Map<String, dynamic>.from(data as Map);
      _currentUserId = ready['userId'] as String?;
      socket.emit('chat:join', {
        'otherUserId': widget.receiverId,
        'productId': widget.productId,
      });
    });
    socket.on('chat:history', (dynamic data) {
      final payload = Map<String, dynamic>.from(data as Map);
      final history = (payload['messages'] as List<dynamic>? ?? const [])
          .map((item) => Map<String, dynamic>.from(item as Map))
          .where((item) => item['productId'] == widget.productId)
          .toList(growable: false);
      if (mounted) {
        setState(() {
          _messages
            ..clear()
            ..addAll(history);
        });
      }
    });
    socket.on('chat:message', (dynamic data) {
      final message = Map<String, dynamic>.from(data as Map);
      if (message['productId'] != widget.productId) return;
      if (mounted) setState(() => _messages.add(message));
    });
    socket.on('chat:cooldown', (dynamic data) {
      final payload = Map<String, dynamic>.from(data as Map);
      _startCooldown((payload['retryAfterSeconds'] as num?)?.toInt() ?? 60);
    });
    socket.on('chat:error', (dynamic data) {
      if (!mounted) return;
      setState(() {
        _error = data is Map ? data['message']?.toString() : 'Chat failed';
      });
    });
    socket.connect();
    _socket = socket;
  }

  void _startCooldown(int seconds) {
    _cooldownTimer?.cancel();
    if (mounted) setState(() => _cooldownSeconds = seconds);
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_cooldownSeconds <= 1) {
        timer.cancel();
        setState(() => _cooldownSeconds = 0);
      } else {
        setState(() => _cooldownSeconds -= 1);
      }
    });
  }

  void _send() {
    final text = _controller.text.trim();
    if (!_connected || _cooldownSeconds > 0 || text.isEmpty) return;
    _socket?.emit('chat:send', {
      'receiverId': widget.receiverId,
      'productId': widget.productId,
      'text': text,
      'clientMessageId': DateTime.now().microsecondsSinceEpoch.toString(),
    });
    _controller.clear();
  }

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    _socket?.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          top: 16,
          bottom: MediaQuery.viewInsetsOf(context).bottom + 16,
        ),
        child: SizedBox(
          height: MediaQuery.sizeOf(context).height * .68,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.productTitle,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 4),
              Text(
                _connected
                    ? 'Temporary chat · saved in Redis for 1 hour'
                    : 'Connecting…',
                style: const TextStyle(color: Colors.grey),
              ),
              if (_cooldownSeconds > 0)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    'You can send again in $_cooldownSeconds seconds',
                    style: const TextStyle(color: Colors.orange),
                  ),
                ),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: const TextStyle(color: Colors.red)),
              ],
              const Divider(height: 24),
              Expanded(
                child: _messages.isEmpty
                    ? const Center(
                        child: Text(
                          'Start the conversation.\nMessages automatically expire after 1 hour.',
                          textAlign: TextAlign.center,
                        ),
                      )
                    : ListView.builder(
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final message = _messages[index];
                          final mine = message['senderId'] == _currentUserId;
                          return Align(
                            alignment: mine
                                ? Alignment.centerRight
                                : Alignment.centerLeft,
                            child: Container(
                              constraints: const BoxConstraints(maxWidth: 280),
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 9,
                              ),
                              decoration: BoxDecoration(
                                color: mine
                                    ? Theme.of(context).colorScheme.primary
                                    : Theme.of(context)
                                        .colorScheme
                                        .surfaceContainerHighest,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: Text(
                                message['text']?.toString() ?? '',
                                style: TextStyle(
                                  color: mine
                                      ? Theme.of(context).colorScheme.onPrimary
                                      : null,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
              ),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      enabled: _connected && _cooldownSeconds == 0,
                      maxLength: 1000,
                      minLines: 1,
                      maxLines: 4,
                      decoration: InputDecoration(
                        hintText: _cooldownSeconds > 0
                            ? 'Wait $_cooldownSeconds seconds'
                            : 'Type a temporary message',
                        counterText: '',
                      ),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed:
                        _connected && _cooldownSeconds == 0 ? _send : null,
                    icon: const Icon(Icons.send_rounded),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
