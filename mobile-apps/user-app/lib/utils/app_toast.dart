import 'package:flutter/material.dart';

enum ToastType { success, error, info }

class AppToast {
  static OverlayEntry? _current;

  static void show(
    BuildContext context,
    String message, {
    ToastType type = ToastType.info,
    Duration duration = const Duration(seconds: 3),
  }) {
    _current?.remove();
    _current = null;

    final colors = {
      ToastType.success: const Color(0xFF16A34A),
      ToastType.error: const Color(0xFFDC2626),
      ToastType.info: const Color(0xFF2563EB),
    };
    final icons = {
      ToastType.success: Icons.check_circle_rounded,
      ToastType.error: Icons.error_rounded,
      ToastType.info: Icons.info_rounded,
    };

    final overlay = Overlay.of(context);
    final entry = OverlayEntry(
      builder: (_) => _ToastWidget(
        message: message,
        color: colors[type]!,
        icon: icons[type]!,
        onDismiss: () { _current?.remove(); _current = null; },
      ),
    );

    _current = entry;
    overlay.insert(entry);

    Future.delayed(duration, () {
      if (_current == entry) { _current?.remove(); _current = null; }
    });
  }
}

class _ToastWidget extends StatefulWidget {
  final String message;
  final Color color;
  final IconData icon;
  final VoidCallback onDismiss;

  const _ToastWidget({required this.message, required this.color, required this.icon, required this.onDismiss});

  @override
  State<_ToastWidget> createState() => _ToastWidgetState();
}

class _ToastWidgetState extends State<_ToastWidget> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _opacity;
  late Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
    _opacity = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
    _slide = Tween<Offset>(begin: const Offset(0, -0.3), end: Offset.zero)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top + kToolbarHeight + 8;
    return Positioned(
      top: topPadding,
      left: 24,
      right: 24,
      child: FadeTransition(
        opacity: _opacity,
        child: SlideTransition(
          position: _slide,
          child: Material(
            color: Colors.transparent,
            child: GestureDetector(
              onTap: widget.onDismiss,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: widget.color,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: widget.color.withOpacity(0.35),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Icon(widget.icon, color: Colors.white, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        widget.message,
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Icon(Icons.close, color: Colors.white.withOpacity(0.7), size: 16),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
