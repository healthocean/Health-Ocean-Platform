import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/booking_provider.dart';
import '../utils/constants.dart';
import '../utils/app_toast.dart';
import '../widgets/shimmer_placeholder.dart';
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
          AppToast.show(context, 'Refresh failed: $e', isError: true);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final bookingProvider = Provider.of<BookingProvider>(context);

    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
          slivers: [
            SliverAppBar(
              expandedHeight: 160.0,
              floating: false,
              pinned: true,
              backgroundColor: Colors.white,
              elevation: 0,
              centerTitle: false,
              leadingWidth: 0,
              automaticallyImplyLeading: false,
              title: _currentIndex == 0 ? Padding(
                padding: const EdgeInsets.only(left: 0),
                child: Image.asset('assets/healthoceanlogo.png', height: 35, filterQuality: FilterQuality.high),
              ) : null,
              flexibleSpace: FlexibleSpaceBar(
                expandedTitleScale: 1.0,
                centerTitle: false,
                background: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 105, 24, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hello, ${auth.name?.split(" ")[0] ?? "Collector"}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w900, 
                          color: ApiConstants.deepNavy,
                          fontSize: 24,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Ready for today\'s collection?',
                        style: TextStyle(color: Colors.blueGrey, fontSize: 11, fontWeight: FontWeight.normal),
                      ),
                    ],
                  ),
                ),
              ),
              actions: [
                Container(
                  margin: const EdgeInsets.only(right: 20, top: 8, bottom: 8),
                  child: Stack(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.notifications_none_rounded, color: ApiConstants.deepNavy, size: 28),
                        onPressed: () {},
                      ),
                      Positioned(
                        right: 8,
                        top: 8,
                        child: Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: Colors.redAccent,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            CupertinoSliverRefreshControl(
              onRefresh: _fetchBookings,
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'TODAY\'S TASKS',
                          style: TextStyle(
                            fontSize: 12, 
                            fontWeight: FontWeight.w800, 
                            color: Colors.grey, 
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          width: 40,
                          height: 3,
                          decoration: BoxDecoration(
                            color: ApiConstants.oceanEnd,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: ApiConstants.oceanLight.withOpacity(0.4),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${bookingProvider.activeBookings.length} Assignments',
                        style: const TextStyle(
                          color: ApiConstants.oceanEnd, 
                          fontWeight: FontWeight.bold, 
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (bookingProvider.isLoading)
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: ShimmerPlaceholder.rounded(height: 140, borderRadius: 24),
                    ),
                    childCount: 3,
                  ),
                ),
              )
            else if (bookingProvider.activeBookings.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(30),
                        decoration: BoxDecoration(
                          color: ApiConstants.oceanLight.withOpacity(0.3),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.assignment_turned_in_rounded, size: 60, color: ApiConstants.oceanMid),
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'Everything caught up!',
                        style: TextStyle(color: ApiConstants.deepNavy, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const Text(
                        'No assignments for today.',
                        style: TextStyle(color: Colors.grey, fontSize: 14),
                      ),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final booking = bookingProvider.activeBookings[index];
                      return _buildBookingCard(booking);
                    },
                    childCount: bookingProvider.activeBookings.length,
                  ),
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 20)),
          ],
        ),
      );
  }

  // Adding this to fix potential reference issues in Title
  int get _currentIndex => 0; 

  Widget _buildBookingCard(dynamic booking) {
    String status = booking['status'];
    Color statusColor;
    IconData statusIcon;

    switch (status) {
      case 'On My Way':
        statusColor = Colors.orange.shade700;
        statusIcon = Icons.directions_bike;
        break;
      case 'Arrived':
        statusColor = Colors.blue.shade700;
        statusIcon = Icons.near_me;
        break;
      case 'Sample Collected':
        statusColor = Colors.green.shade700;
        statusIcon = Icons.check_circle_rounded;
        break;
      default:
        statusColor = ApiConstants.oceanEnd;
        statusIcon = Icons.access_time_filled_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade100, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => BookingDetailScreen(booking: booking),
            ),
          );
        },
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(statusIcon, color: statusColor, size: 14),
                        const SizedBox(width: 6),
                        Text(
                          status.toUpperCase(),
                          style: TextStyle(
                            color: statusColor, 
                            fontSize: 10, 
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    booking['timeSlot'] ?? '',
                    style: const TextStyle(fontWeight: FontWeight.w800, color: ApiConstants.deepNavy, fontSize: 13),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                booking['name'] ?? 'Unknown Patient',
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: ApiConstants.deepNavy, letterSpacing: -0.5),
              ),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.location_on_rounded, size: 16, color: Colors.grey),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      booking['address'] ?? 'No address provided',
                      style: TextStyle(fontSize: 13, color: Colors.grey.shade600, height: 1.4),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 16),
              Row(
                children: [
                  const Icon(Icons.science_rounded, size: 16, color: ApiConstants.oceanEnd),
                  const SizedBox(width: 8),
                  const Text('Test Code: ', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
                   Text(
                     (booking['testId'] ?? booking['_id'] ?? 'N/A').toString().substring(0, min(8, (booking['testId'] ?? booking['_id'] ?? 'N/A').toString().length)), 
                     style: const TextStyle(color: ApiConstants.deepNavy, fontSize: 12, fontWeight: FontWeight.w900)
                   ),
                  const Spacer(),
                  const Text('GO TO DETAILS', style: TextStyle(color: ApiConstants.oceanEnd, fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                  const Icon(Icons.chevron_right_rounded, color: ApiConstants.oceanEnd, size: 18),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
