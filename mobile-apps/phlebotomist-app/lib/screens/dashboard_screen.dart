import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/booking_provider.dart';
import '../utils/constants.dart';
import '../screens/booking_detail_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchBookings();
    });
  }

  Future<void> _fetchBookings() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.isAuthenticated) {
      try {
        await Provider.of<BookingProvider>(context, listen: false)
            .fetchAssignedBookings(auth.token!, auth.employeeId!);
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error fetching bookings: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final bookingProvider = Provider.of<BookingProvider>(context);

    return Scaffold(
      backgroundColor: ApiConstants.paleCyan,
      body: RefreshIndicator(
        onRefresh: _fetchBookings,
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 200.0,
              floating: false,
              pinned: true,
              flexibleSpace: FlexibleSpaceBar(
                title: Text(
                  'Hello, ${auth.name ?? "Collector"}',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                ),
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [ApiConstants.oceanStart, ApiConstants.oceanMid, ApiConstants.oceanEnd],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: Stack(
                    children: [
                      Positioned(
                        right: -50,
                        top: -50,
                        child: CircleAvatar(
                          radius: 100,
                          backgroundColor: Colors.white.withOpacity(0.1),
                        ),
                      ),
                      Positioned(
                        left: 20,
                        bottom: 80,
                        child: Text(
                          '${DateTime.now().day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][DateTime.now().month-1]}',
                          style: const TextStyle(color: Colors.white70, fontSize: 16),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.logout),
                  onPressed: () => auth.logout(),
                ),
              ],
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Text(
                  'Assignments for Today (${bookingProvider.assignedBookings.length})',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: ApiConstants.deepNavy),
                ),
              ),
            ),
            if (bookingProvider.isLoading)
              const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
            else if (bookingProvider.assignedBookings.isEmpty)
              const SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.assignment_turned_in_outlined, size: 80, color: Colors.grey),
                      SizedBox(height: 10),
                      Text('No assignments for today', style: TextStyle(color: Colors.grey, fontSize: 18)),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 15),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final booking = bookingProvider.assignedBookings[index];
                      return _buildBookingCard(booking);
                    },
                    childCount: bookingProvider.assignedBookings.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookingCard(dynamic booking) {
    String status = booking['status'];
    Color statusColor;
    IconData statusIcon;

    switch (status) {
      case 'On My Way':
        statusColor = Colors.orange;
        statusIcon = Icons.directions_bike;
        break;
      case 'Arrived':
        statusColor = Colors.blue;
        statusIcon = Icons.near_me;
        break;
      case 'Sample Collected':
        statusColor = Colors.purple;
        statusIcon = Icons.science;
        break;
      default:
        statusColor = ApiConstants.oceanEnd;
        statusIcon = Icons.calendar_today;
    }

    return Card(
      elevation: 5,
      margin: const EdgeInsets.only(bottom: 15),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => BookingDetailScreen(booking: booking),
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.all(15),
          child: Row(
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(statusIcon, color: statusColor, size: 30),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      booking['name'],
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 5),
                    Row(
                      children: [
                        const Icon(Icons.access_time_outlined, size: 14, color: Colors.grey),
                        const SizedBox(width: 5),
                        Expanded(
                          child: Text(
                            '${booking['timeSlot']} | ${booking['date']}',
                            style: const TextStyle(fontSize: 14, color: Colors.grey),
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 14, color: Colors.grey),
                        const SizedBox(width: 5),
                        Expanded(
                          child: Text(
                            booking['address'],
                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  status,
                  style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
