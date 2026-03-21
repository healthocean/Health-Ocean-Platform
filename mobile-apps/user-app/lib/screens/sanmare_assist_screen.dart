import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';
import '../utils/app_toast.dart';
import 'suggested_tests_screen.dart';

class SanmareAssistScreen extends StatefulWidget {
  const SanmareAssistScreen({super.key});

  @override
  State<SanmareAssistScreen> createState() => _SanmareAssistScreenState();
}

class _SanmareAssistScreenState extends State<SanmareAssistScreen> with TickerProviderStateMixin {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isLoading = false;
  final ScrollController _scrollController = ScrollController();
  late AnimationController _typingController;

  @override
  void initState() {
    super.initState();
    _typingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);
    _loadChatHistory();
  }

  @override
  void dispose() {
    _typingController.dispose();
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _loadChatHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString('chat_history');
    if (stored != null) {
      final List<dynamic> decoded = json.decode(stored);
      setState(() {
        _messages.addAll(decoded.map((e) => Map<String, dynamic>.from(e)));
      });
    } else {
      _clearChat(); // Call _clearChat to initialize with the greeting
    }
    _scrollToBottom();
  }

  void _confirmNewChat(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('New Chat?'),
        content: const Text('This will clear your current conversation history. You cannot undo this.'),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _clearChat();
            },
            child: const Text('Start New', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _clearChat() async {
    setState(() {
      _messages.clear();
      _messages.add({
        'isUser': false,
        'text': 'Hello! I am Sanmare Assist, your personal health companion. How can I help you today?',
        'time': DateTime.now().toIso8601String(),
      });
    });
    await _saveChatHistory();
    _scrollToBottom();
  }

  Future<void> _saveChatHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('chat_history', json.encode(_messages));
  }

  Future<void> _sendMessage() async {
    final query = _controller.text.trim();
    if (query.isEmpty) return;

    setState(() {
      _messages.add({
        'isUser': true,
        'text': query,
        'time': DateTime.now().toIso8601String(), // Changed to Iso8601String
      });
      _isLoading = true;
      _controller.clear();
    });
    _scrollToBottom();

    try {
      // Use the specific chatbot endpoint
      final response = await http.post(
        Uri.parse(ApiConstants.chatbot),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'query': query}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _messages.add({
            'isUser': false,
            'text': data['answer'],
            'sources': data['sources'],
            'suggested_tests': data['suggested_tests'] ?? [],
            'time': DateTime.now().toIso8601String(),
          });
          _isLoading = false;
        });
        await _saveChatHistory(); // Save after successful response
      } else {
        throw Exception('Server error: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        _messages.add({
          'isUser': false,
          'text': "I'm having trouble connecting right now. Please make sure the Sanmare AI service is running.",
          'time': DateTime.now().toIso8601String(),
        });
        _isLoading = false;
      });
      await _saveChatHistory();
      AppToast.show(context, 'Chat error: $e', type: ToastType.error);
    }
    _scrollToBottom();
  }

  Future<void> _openURL(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      AppToast.show(context, 'Could not open link', type: ToastType.error);
    }
  }

  void _showAllSources(List<dynamic> sources) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('All Verified Sources', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
              ],
            ),
            const SizedBox(height: 16),
            ...sources.map((src) => ListTile(
              leading: const Icon(Icons.link, color: Colors.blue),
              title: Text(src.toString(), style: const TextStyle(fontSize: 14, color: Colors.blue, decoration: TextDecoration.underline)),
              onTap: () {
                Navigator.pop(context);
                _openURL(src.toString());
              },
            )).toList(),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final gradStart = Color(0xFF90E0EF);
    final gradMid   = Color(0xFF00B4D8);
    final gradEnd   = Color(0xFF0077B6);

    return Scaffold(
      backgroundColor: const Color(0xFFF0FAFF),
      appBar: AppBar(
        elevation: 0,
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [gradStart, gradMid, gradEnd],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        title: Row(
          children: [
            CircleAvatar(
              backgroundColor: Colors.white,
              radius: 16,
              child: Icon(Icons.support_agent_rounded, color: gradEnd, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Sanmare Assist', 
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                Text('Online | AI Health Companion', 
                    style: TextStyle(fontSize: 10, color: Colors.white70)),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded, color: Colors.white, size: 28), // Bold plus icon
            tooltip: 'New Chat',
            onPressed: () => _confirmNewChat(context),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length) {
                  return _buildTypingIndicator(gradEnd);
                }
                final msg = _messages[index];
                return _buildChatBubble(msg, gradEnd);
              },
            ),
          ),
          _buildInputArea(gradEnd),
        ],
      ),
    );
  }

  Widget _buildTypingIndicator(Color primary) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
            bottomRight: Radius.circular(20),
          ),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 4))
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildDot(0),
            const SizedBox(width: 4),
            _buildDot(1),
            const SizedBox(width: 4),
            _buildDot(2),
          ],
        ),
      ),
    );
  }

  Widget _buildDot(int index) {
    return ScaleTransition(
      scale: _typingController.drive(
        Tween<double>(begin: 1.0, end: 1.4).chain(
          CurveTween(curve: Interval(index * 0.2, 1.0, curve: Curves.easeInOut)),
        ),
      ),
      child: Container(
        width: 6,
        height: 6,
        decoration: const BoxDecoration(
          color: Colors.blueGrey,
          shape: BoxShape.circle,
        ),
      ),
    );
  }

  Widget _buildChatBubble(Map<String, dynamic> msg, Color primary) {
    final isUser = msg['isUser'] as bool;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isUser ? ApiConstants.oceanMid : Colors.white, // user: light‑medium, AI: white
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: Radius.circular(isUser ? 20 : 0),
            bottomRight: Radius.circular(isUser ? 0 : 20),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            MarkdownBody(
              data: msg['text'] as String,
              styleSheet: MarkdownStyleSheet(
                p: TextStyle(
                  color: isUser ? Colors.white : Colors.black87,
                  fontSize: 14,
                  height: 1.4,
                ),
                strong: TextStyle(
                  color: isUser ? Colors.white : Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
            if (msg.containsKey('suggested_tests') && (msg['suggested_tests'] as List).isNotEmpty) ...[
              const SizedBox(height: 12),
              InkWell(
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => SuggestedTestsScreen(
                      tests: List<String>.from(msg['suggested_tests']),
                      query: msg['text'] as String,
                    ),
                  ),
                ),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: ApiConstants.oceanLight.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: ApiConstants.oceanMid.withOpacity(0.1)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'See suggested tests',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: ApiConstants.oceanEnd,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.auto_awesome_rounded, size: 16, color: ApiConstants.oceanMid),
                    ],
                  ),
                ),
              ),
            ],
            if (msg.containsKey('sources') && (msg['sources'] as List).isNotEmpty) ...[
              const Divider(height: 16, color: Colors.black12),
              Row(
                children: [
                  const Icon(Icons.verified_user_rounded, size: 12, color: Colors.green),
                  const SizedBox(width: 6),
                  const Text('Sources:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blueGrey)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          GestureDetector(
                            onTap: () => _openURL(msg['sources'][0].toString()),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.blue.withOpacity(0.05),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.blue.withOpacity(0.15)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Flexible(
                                    child: ConstrainedBox(
                                      constraints: const BoxConstraints(maxWidth: 120),
                                      child: Text(
                                        msg['sources'][0].toString(),
                                        style: const TextStyle(fontSize: 9, color: Colors.blue, fontWeight: FontWeight.w500),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          if ((msg['sources'] as List).length > 1) ...[
                            const SizedBox(width: 8),
                            GestureDetector(
                              onTap: () => _showAllSources(msg['sources']),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.blue.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  '+${(msg['sources'] as List).length - 1}',
                                  style: const TextStyle(fontSize: 9, color: Colors.blue, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
  Widget _buildInputArea(Color primary) {
    return Container(
      padding: EdgeInsets.fromLTRB(16, 4, 16, MediaQuery.of(context).padding.bottom + 10),
      decoration: const BoxDecoration(
        color: Colors.transparent,
      ),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(32),
          boxShadow: [
            BoxShadow(
              color: primary.withOpacity(0.12),
              blurRadius: 24,
              spreadRadius: 2,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                style: const TextStyle(fontSize: 15),
                decoration: InputDecoration(
                  hintText: 'Ask anything about your health...',
                  hintStyle: TextStyle(color: primary.withOpacity(0.4), fontSize: 13),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  errorBorder: InputBorder.none,
                  disabledBorder: InputBorder.none,
                  filled: false,
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [ApiConstants.oceanStart, ApiConstants.oceanMid],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: ApiConstants.oceanMid.withOpacity(0.35),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: IconButton(
                onPressed: _sendMessage,
                icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                splashRadius: 24,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
