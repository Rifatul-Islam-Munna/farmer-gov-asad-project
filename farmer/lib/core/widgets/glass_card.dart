import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_glass_morphism/flutter_glass_morphism.dart';

import '../theme/app_theme.dart';

class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding = EdgeInsets.zero,
    this.margin = EdgeInsets.zero,
    this.borderRadius = 24,
    this.blur = 24,
    this.opacity = .20,
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

    Widget panel = DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: radius,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .30),
            blurRadius: elevation == null ? 30 : 16 + elevation! * 2,
            offset: const Offset(0, 14),
          ),
          if (glow)
            BoxShadow(
              color: AppColors.primary.withValues(alpha: .12),
              blurRadius: 30,
              spreadRadius: -8,
            ),
        ],
      ),
      child: GlassMorphismMaterial(
        blurIntensity: blur,
        opacity: opacity,
        backgroundOpacity: .58,
        glassThickness: 1.8,
        tintColor: color ?? const Color(0xFF2D806E),
        borderRadius: radius,
        adaptToBackground: true,
        enableBackgroundDistortion: true,
        enableGlassBorder: true,
        shadows: const [],
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
                        Colors.white.withValues(alpha: .12),
                        Colors.transparent,
                        AppColors.primary.withValues(alpha: .045),
                      ],
                      stops: const [0, .42, 1],
                    ),
                  ),
                ),
              ),
            ),
            Padding(padding: padding, child: child),
          ],
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
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF123E34), Color(0xFF071E19), Color(0xFF020D0B)],
          stops: [0, .48, 1],
        ),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          const CustomPaint(painter: _OrganicBackgroundPainter()),
          const Positioned(
            top: -120,
            right: -80,
            child: _Glow(size: 320, color: Color(0x3848F1C2)),
          ),
          const Positioned(
            top: 300,
            left: -130,
            child: _Glow(size: 290, color: Color(0x1F25C38F)),
          ),
          const Positioned(
            bottom: -140,
            right: -80,
            child: _Glow(size: 350, color: Color(0x2520B77D)),
          ),
          child,
        ],
      ),
    );
  }
}

class _OrganicBackgroundPainter extends CustomPainter {
  const _OrganicBackgroundPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final leafPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = const Color(0xFF63E7B8).withValues(alpha: .04);
    final veinPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1
      ..color = const Color(0xFF76F4CC).withValues(alpha: .055);

    final leaves = <Rect>[
      Rect.fromLTWH(size.width * .67, size.height * .08, 120, 52),
      Rect.fromLTWH(-28, size.height * .30, 135, 56),
      Rect.fromLTWH(size.width * .73, size.height * .58, 150, 62),
      Rect.fromLTWH(size.width * .08, size.height * .82, 125, 52),
    ];

    for (final rect in leaves) {
      canvas.save();
      canvas.translate(rect.center.dx, rect.center.dy);
      canvas.rotate(-.42);
      final local = Rect.fromCenter(
        center: Offset.zero,
        width: rect.width,
        height: rect.height,
      );
      canvas.drawOval(local, leafPaint);
      canvas.drawLine(
        Offset(-rect.width * .38, 0),
        Offset(rect.width * .38, 0),
        veinPaint,
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _Glow extends StatelessWidget {
  const _Glow({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return ImageFiltered(
      imageFilter: ImageFilter.blur(sigmaX: 65, sigmaY: 65),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(shape: BoxShape.circle, color: color),
      ),
    );
  }
}
