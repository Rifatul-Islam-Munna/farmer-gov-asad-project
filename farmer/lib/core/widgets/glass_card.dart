import 'dart:ui';

import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding = EdgeInsets.zero,
    this.margin = EdgeInsets.zero,
    this.borderRadius = 24,
    this.blur = 9,
    this.opacity = .12,
    this.onTap,
    this.color,
    this.elevation,
    this.shape,
    this.clipBehavior = Clip.antiAlias,
    this.glow = true,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry margin;
  final double borderRadius;
  final double blur;
  final double opacity;
  final VoidCallback? onTap;
  final Color? color;
  final double? elevation;
  final ShapeBorder? shape;
  final Clip clipBehavior;
  final bool glow;

  @override
  Widget build(BuildContext context) {
    final radius = shape is RoundedRectangleBorder
        ? (shape as RoundedRectangleBorder).borderRadius.resolve(
            Directionality.of(context),
          )
        : BorderRadius.circular(borderRadius);
    final tint = color ?? AppColors.glassTint;

    Widget panel = DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: radius,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .20),
            blurRadius: elevation == null ? 18 : 10 + elevation! * 1.4,
            offset: const Offset(0, 10),
          ),
          if (glow)
            BoxShadow(
              color: AppColors.primary.withValues(alpha: .16),
              blurRadius: 22,
              spreadRadius: -12,
            ),
        ],
      ),
      child: ClipRRect(
        borderRadius: radius,
        clipBehavior: clipBehavior,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: DecoratedBox(
            decoration: BoxDecoration(
              borderRadius: radius,
              color: tint.withValues(alpha: opacity),
              border: Border.all(
                color: Colors.white.withValues(alpha: .22),
                width: 1,
              ),
            ),
            child: Stack(
              fit: StackFit.passthrough,
              children: [
                Positioned.fill(
                  child: IgnorePointer(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        borderRadius: radius,
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Colors.white.withValues(alpha: .21),
                            Colors.white.withValues(alpha: .055),
                            AppColors.primaryDark.withValues(alpha: .08),
                          ],
                          stops: const [0, .38, 1],
                        ),
                      ),
                    ),
                  ),
                ),
                Positioned.fill(
                  child: IgnorePointer(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        borderRadius: radius,
                        border: Border(
                          top: BorderSide(
                            color: Colors.white.withValues(alpha: .34),
                          ),
                          left: BorderSide(
                            color: Colors.white.withValues(alpha: .16),
                          ),
                          bottom: BorderSide(
                            color: AppColors.primary.withValues(alpha: .22),
                          ),
                          right: BorderSide(
                            color: AppColors.primary.withValues(alpha: .12),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                Padding(padding: padding, child: child),
              ],
            ),
          ),
        ),
      ),
    );

    if (onTap != null) {
      panel = Material(
        color: Colors.transparent,
        child: InkWell(onTap: onTap, borderRadius: radius, child: panel),
      );
    }

    return Padding(padding: margin, child: panel);
  }
}

class GlassBackground extends StatelessWidget {
  const GlassBackground({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        Image.asset(
          'assets/images/plant_leaf.jpg',
          fit: BoxFit.cover,
          alignment: Alignment.center,
        ),
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0x87051613), Color(0xB3061713), Color(0xE3020D0B)],
              stops: [0, .48, 1],
            ),
          ),
        ),
        DecoratedBox(
          decoration: BoxDecoration(
            gradient: RadialGradient(
              center: const Alignment(.70, -.88),
              radius: 1.05,
              colors: [
                AppColors.primary.withValues(alpha: .24),
                Colors.transparent,
              ],
            ),
          ),
        ),
        DecoratedBox(
          decoration: BoxDecoration(
            gradient: RadialGradient(
              center: const Alignment(-.90, .30),
              radius: .85,
              colors: [
                AppColors.secondary.withValues(alpha: .16),
                Colors.transparent,
              ],
            ),
          ),
        ),
        const CustomPaint(painter: _ScanTexturePainter()),
        child,
      ],
    );
  }
}

class _ScanTexturePainter extends CustomPainter {
  const _ScanTexturePainter();

  @override
  void paint(Canvas canvas, Size size) {
    final dotPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = Colors.white.withValues(alpha: .022);
    for (double y = 18; y < size.height; y += 28) {
      for (double x = 18; x < size.width; x += 28) {
        canvas.drawCircle(Offset(x, y), .75, dotPaint);
      }
    }

    final linePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = .7
      ..color = AppColors.primary.withValues(alpha: .045);
    for (double y = 0; y < size.height; y += 86) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y + 24), linePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
