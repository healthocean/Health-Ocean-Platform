import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';
import '../widgets/app_dialog.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('My Profile', style: TextStyle(color: ApiConstants.deepNavy, fontWeight: FontWeight.w900, letterSpacing: -0.5)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 20),
            Center(
              child: Stack(
                children: [
                  Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: ApiConstants.oceanEnd.withOpacity(0.1), width: 8),
                    ),
                    child: const CircleAvatar(
                      radius: 50, 
                      backgroundColor: ApiConstants.oceanLight, 
                      child: Icon(Icons.person_rounded, size: 60, color: ApiConstants.oceanEnd)
                    ),
                  ),
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle),
                      child: const Icon(Icons.check, color: Colors.white, size: 16),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Text(
              auth.name ?? 'Phlebotomist', 
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: ApiConstants.deepNavy, letterSpacing: -0.5)
            ),
            Text(
              'ID: ${auth.employeeId ?? 'N/A'}', 
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600, fontWeight: FontWeight.w600)
            ),
            const SizedBox(height: 30),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle('ACCOUNT DETAILS'),
                  const SizedBox(height: 12),
                  _buildProfileCard([
                    _buildProfileItem(Icons.email_rounded, 'Email Address', auth.employee?['email'] ?? 'N/A'),
                    const Divider(height: 1),
                    _buildProfileItem(Icons.phone_rounded, 'Phone Number', auth.phone ?? 'N/A'),
                    const Divider(height: 1),
                    _buildProfileItem(Icons.verified_user_rounded, 'Job Title', auth.employee?['role'] ?? 'Technician'),
                  ]),
                  
                  const SizedBox(height: 32),
                  _buildSectionTitle('LABORATORY INFORMATION'),
                  const SizedBox(height: 12),
                   _buildProfileCard([
                    _buildProfileItem(Icons.business_rounded, 'Lab Name', auth.lab?['name'] ?? 'Loading...'),
                    const Divider(height: 1),
                    _buildProfileItem(Icons.location_on_rounded, 'Lab Address', '${auth.lab?['address'] ?? 'N/A'}, ${auth.lab?['city'] ?? ''}'),
                    if (auth.lab?['contactNumber'] != null) ...[
                      const Divider(height: 1),
                      _buildProfileItem(Icons.phone_android_rounded, 'Lab Contact', auth.lab?['contactNumber']),
                    ],
                  ]),

                  const SizedBox(height: 40),
                  SizedBox(
                    width: double.infinity,
                    height: 60,
                    child: ElevatedButton.icon(
                      onPressed: () => _showSignOutDialog(context, auth),
                      icon: const Icon(Icons.logout_rounded, size: 20),
                      label: const Text('SIGN OUT', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red.shade50,
                        foregroundColor: Colors.red.shade700,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: BorderSide(color: Colors.red.shade100),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSignOutDialog(BuildContext context, dynamic auth) async {
    final confirmed = await AppDialog.show(
      context,
      title: 'Sign Out?',
      message: 'Are you sure you want to sign out from your collector account?',
      confirmText: 'SIGN OUT',
      cancelText: 'CANCEL',
      icon: Icons.logout_rounded,
      iconColor: Colors.red.shade400,
      isDestructive: true,
    );

    if (confirmed == true) {
      auth.logout();
    }
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 11, 
        fontWeight: FontWeight.w800, 
        color: Colors.grey, 
        letterSpacing: 1.2
      ),
    );
  }

  Widget _buildProfileCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade100, width: 2),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildProfileItem(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: ApiConstants.oceanLight.withOpacity(0.3),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: ApiConstants.oceanEnd, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(fontSize: 11, color: Colors.grey.shade500, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: ApiConstants.deepNavy)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
