import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../utils/app_toast.dart';
import '../services/api_service.dart';
import '../providers/auth_provider.dart';

class HealthHistoryScreen extends StatefulWidget {
  const HealthHistoryScreen({super.key});

  @override
  State<HealthHistoryScreen> createState() => _HealthHistoryScreenState();
}

class _HealthHistoryScreenState extends State<HealthHistoryScreen> {
  List<dynamic> _historyItems = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.token == null) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }

    try {
      final bookings = await ApiService.getBookings(authProvider.token!);
      List<dynamic> items = [];
      for (var b in bookings) {
        final date = b['date']?.toString() ?? 'Unknown Date';
        final status = b['reportUrl'] != null ? 'Report Available' : 'Pending/In Progress';
        final color = b['reportUrl'] != null ? Colors.green : Colors.orange;
        final icon = b['reportUrl'] != null ? Icons.check_circle : Icons.pending_actions;
        
        if (b['tests'] != null) {
          for (var t in b['tests']) {
            items.add({'title': t.toString(), 'date': date, 'status': status, 'color': color, 'icon': icon});
          }
        }
        if (b['packages'] != null) {
          for (var p in b['packages']) {
            items.add({'title': p.toString(), 'date': date, 'status': status, 'color': color, 'icon': icon});
          }
        }
      }
      if (mounted) {
        setState(() {
          _historyItems = items;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatDate(String raw) {
    try {
      final dt = DateTime.parse(raw);
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
    } catch (_) {
      return raw;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF90E0EF), Color(0xFF00B4D8), Color(0xFF0077B6)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        title: const Text('Health History', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {},
          ),
        ],
      ),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator()) 
          : _historyItems.isEmpty 
              ? const Center(child: Text('No health history found.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _historyItems.length,
                  itemBuilder: (context, index) {
                    final item = _historyItems[index];
                    return _buildTimelineItem(
                      context,
                      item['title'],
                      _formatDate(item['date']),
                      item['status'],
                      item['color'],
                      item['icon'],
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          AppToast.show(context, 'Upload external report feature coming soon', type: ToastType.info);
        },
        icon: const Icon(Icons.upload),
        label: const Text('Upload Report'),
        backgroundColor: Theme.of(context).colorScheme.primary,
      ),
    );
  }

  Widget _buildTimelineItem(BuildContext context, String title, String date, String status, Color color, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {},
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(Icons.calendar_today, size: 13, color: Colors.grey.shade600),
                          const SizedBox(width: 4),
                          Text(date, style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(status, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right, color: Colors.grey.shade400),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
