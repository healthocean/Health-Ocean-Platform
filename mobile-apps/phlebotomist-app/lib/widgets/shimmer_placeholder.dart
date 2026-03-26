import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerPlaceholder extends StatelessWidget {
  final double width;
  final double height;
  final ShapeBorder? shapeBorder;
  final double? borderRadius;

  const ShimmerPlaceholder.rectangular({
    super.key,
    this.width = double.infinity,
    required this.height,
  }) : shapeBorder = const RoundedRectangleBorder(),
       borderRadius = null;

  const ShimmerPlaceholder.circular({
    super.key,
    required this.width,
    required this.height,
  }) : shapeBorder = const CircleBorder(),
       borderRadius = null;

  const ShimmerPlaceholder.rounded({
    super.key,
    this.width = double.infinity,
    required this.height,
    this.borderRadius = 12.0,
  }) : shapeBorder = null;

  @override
  Widget build(BuildContext context) {
    final effectiveShape = shapeBorder ?? RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(borderRadius ?? 0),
    );

    return Shimmer.fromColors(
      baseColor: Colors.grey.shade100,
      highlightColor: Colors.white,
      period: const Duration(milliseconds: 1500),
      child: Container(
        width: width,
        height: height,
        decoration: ShapeDecoration(
          color: Colors.white,
          shape: effectiveShape,
        ),
      ),
    );
  }
}
