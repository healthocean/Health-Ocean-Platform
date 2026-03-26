import 'package:flutter/material.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

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
        title: const Text('Privacy Policy', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Privacy Policy for Health Ocean',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: darkNavy),
            ),
            const SizedBox(height: 8),
            Text(
              'Effective Date: March 21, 2026',
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 24),
            _buildSection(
              '1. Data We Collect',
              'Health Ocean collects personal information (name, phone, email) and sensitive health data required for diagnostic testing. This includes your age, gender, and specific test requirements passed to our certified laboratory partners.',
            ),
            _buildSection(
              '2. How We Use Your Data',
              'Your information is used exclusively to facilitate home sample collection, process laboratory tests, and deliver secure digital reports to your profile. We do not use your health data for marketing purposes.',
            ),
            _buildSection(
              '3. Data Sharing & Security',
              'We share your details only with our authorized sample collection phlebotomists and certified pathology labs. All health reports are protected with 256-bit encryption and stored on secure cloud servers.',
            ),
            _buildSection(
              '4. Your Rights',
              'You have the right to access your health history at any time and request the permanent deletion of your account and related health data from our servers.',
            ),
            _buildSection(
              '5. Contact Information',
              'If you have any questions regarding this Privacy Policy or how your data is handled, please contact our Data Protection Officer at:',
            ),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.email_outlined, color: primaryColor),
                  SizedBox(width: 12),
                  Text(
                    'thehealthocean@gmail.com',
                    style: TextStyle(fontWeight: FontWeight.bold, color: primaryColor, fontSize: 16),
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

  Widget _buildSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0077B6)),
          ),
          const SizedBox(height: 10),
          Text(
            content,
            style: const TextStyle(fontSize: 15, color: Colors.black87, height: 1.5),
          ),
        ],
      ),
    );
  }
}
