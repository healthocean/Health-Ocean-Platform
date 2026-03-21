import 'package:flutter/material.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFF00B4D8);
    const darkNavy = Color(0xFF03045E);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: darkNavy,
        title: const Text('Help & Support', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'How can we help you?',
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: darkNavy, letterSpacing: -0.5),
            ),
            const SizedBox(height: 12),
            Text(
              'Our team is dedicated to providing you with the best experience and support for all your health-related needs.',
              style: TextStyle(fontSize: 15, color: Colors.grey.shade600, height: 1.5),
            ),
            const SizedBox(height: 32),
            _buildFAQTile('How do I book a test/package?', 'Browse through your home screen, choose a test or package, and add it to your cart. Proceed to checkout and pick your convenient time slot for sample collection.'),
            _buildFAQTile('Where can I see my reports?', 'All laboratory-processed reports will be instantly available in the "Reports" section as soon as they are processed by our laboratory partners.'),
            _buildFAQTile('How secure is my health data?', 'We use 256-bit AES encryption to protect all your laboratory reports and personal information, ensuring total privacy.'),
            const SizedBox(height: 48),
            const Text(
              'Still need help?',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: darkNavy),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  const Text(
                    'Reach out to our support team at:',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.black87),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.email_rounded, color: primaryColor, size: 28),
                      const SizedBox(width: 12),
                      SelectableText(
                        'thehealthocean@gmail.com',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: primaryColor,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildFAQTile(String question, String answer) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            question,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0077B6)),
          ),
          const SizedBox(height: 8),
          Text(
            answer,
            style: const TextStyle(fontSize: 14, color: Colors.black87, height: 1.4),
          ),
        ],
      ),
    );
  }
}
