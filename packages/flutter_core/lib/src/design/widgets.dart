import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'suqya_theme.dart';

enum SqButtonVariant { primary, secondary, ghost, danger }

class SqButton extends StatelessWidget {
  const SqButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = SqButtonVariant.primary,
    this.expanded = true,
    this.height = 52,
    this.loading = false,
    this.icon,
  });

  final String label;
  final VoidCallback? onPressed;
  final SqButtonVariant variant;
  final bool expanded;
  final double height;
  final bool loading;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    final enabled = onPressed != null && !loading;

    Color bg;
    Color fg;
    BorderSide? border;
    switch (variant) {
      case SqButtonVariant.primary:
        bg = t.primary;
        fg = Colors.white;
      case SqButtonVariant.secondary:
        bg = t.primaryMuted;
        fg = t.primary;
      case SqButtonVariant.ghost:
        bg = Colors.transparent;
        fg = t.primary;
        border = BorderSide(color: t.border);
      case SqButtonVariant.danger:
        bg = t.error;
        fg = Colors.white;
    }

    final child = loading
        ? SizedBox(
            width: 22,
            height: 22,
            child: CircularProgressIndicator(strokeWidth: 2.5, color: fg),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 20, color: fg),
                const SizedBox(width: 8),
              ],
              Text(
                label,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: fg,
                ),
              ),
            ],
          );

    return SizedBox(
      width: expanded ? double.infinity : null,
      height: height,
      child: Material(
        color: enabled ? bg : bg.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(t.radiusLg),
        child: InkWell(
          onTap: enabled
              ? () {
                  HapticFeedback.lightImpact();
                  onPressed?.call();
                }
              : null,
          borderRadius: BorderRadius.circular(t.radiusLg),
          child: Container(
            alignment: Alignment.center,
            decoration: border != null
                ? BoxDecoration(
                    borderRadius: BorderRadius.circular(t.radiusLg),
                    border: Border.fromBorderSide(border),
                  )
                : null,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: child,
          ),
        ),
      ),
    );
  }
}

class SqFab extends StatelessWidget {
  const SqFab({super.key, required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
        child: DecoratedBox(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(t.radiusXl),
            boxShadow: [
              BoxShadow(
                color: t.primary.withValues(alpha: 0.28),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: SqButton(label: label, onPressed: onPressed, height: 56),
        ),
      ),
    );
  }
}

class SqCard extends StatelessWidget {
  const SqCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(16),
    this.selected = false,
  });

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets padding;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    return Material(
      color: t.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(t.radiusLg),
        side: BorderSide(
          color: selected ? t.primary : t.border,
          width: selected ? 2 : 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(t.radiusLg),
        child: Padding(padding: padding, child: child),
      ),
    );
  }
}

class SqChip extends StatelessWidget {
  const SqChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
    this.subtitle,
  });

  final String label;
  final String? subtitle;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    return SqCard(
      selected: selected,
      onTap: onTap,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: t.text,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(subtitle!, style: TextStyle(fontSize: 13, color: t.textSecondary)),
          ],
        ],
      ),
    );
  }
}

class SqSkeleton extends StatefulWidget {
  const SqSkeleton({super.key, this.height = 16, this.width, this.radius = 8});

  final double height;
  final double? width;
  final double radius;

  @override
  State<SqSkeleton> createState() => _SqSkeletonState();
}

class _SqSkeletonState extends State<SqSkeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1200),
  )..repeat();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final reduce = MediaQuery.disableAnimationsOf(context);
    if (reduce) {
      _c.stop();
      _c.value = 0.5;
    } else if (!_c.isAnimating) {
      _c.repeat();
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    final reduce = MediaQuery.disableAnimationsOf(context);
    if (reduce) {
      return Container(
        height: widget.height,
        width: widget.width ?? double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(widget.radius),
          color: t.primaryMuted,
        ),
      );
    }
    return AnimatedBuilder(
      animation: _c,
      builder: (_, __) {
        return Container(
          height: widget.height,
          width: widget.width ?? double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.radius),
            gradient: LinearGradient(
              begin: Alignment(-1 + _c.value * 2, 0),
              end: Alignment(1 + _c.value * 2, 0),
              colors: [
                t.border.withValues(alpha: 0.4),
                t.primaryMuted,
                t.border.withValues(alpha: 0.4),
              ],
            ),
          ),
        );
      },
    );
  }
}

class SqEmpty extends StatelessWidget {
  const SqEmpty({
    super.key,
    required this.title,
    required this.subtitle,
    this.actionLabel,
    this.onAction,
    this.icon = Icons.water_drop_outlined,
  });

  final String title;
  final String subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 56, color: t.primary),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: t.text,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 15, color: t.textSecondary, height: 1.4),
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 24),
              SqButton(label: actionLabel!, onPressed: onAction, expanded: false),
            ],
          ],
        ),
      ),
    );
  }
}

class SqErrorState extends StatelessWidget {
  const SqErrorState({
    super.key,
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return SqEmpty(
      icon: Icons.wifi_off_rounded,
      title: 'تعذر التحميل',
      subtitle: message,
      actionLabel: 'إعادة المحاولة',
      onAction: onRetry,
    );
  }
}

class SqMapChrome extends StatelessWidget {
  const SqMapChrome({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    return Material(
      color: t.surface.withValues(alpha: 0.92),
      elevation: 4,
      shadowColor: Colors.black26,
      borderRadius: BorderRadius.circular(t.radiusLg),
      child: child,
    );
  }
}

class SqKpi extends StatelessWidget {
  const SqKpi({
    super.key,
    required this.label,
    required this.value,
    this.delta,
  });

  final String label;
  final String value;
  final String? delta;

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    return SqCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 13, color: t.textSecondary)),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: t.text,
            ),
          ),
          if (delta != null) ...[
            const SizedBox(height: 4),
            Text(delta!, style: TextStyle(fontSize: 12, color: t.success)),
          ],
        ],
      ),
    );
  }
}

class SqSheetScaffold extends StatelessWidget {
  const SqSheetScaffold({
    super.key,
    required this.child,
    this.title,
  });

  final Widget child;
  final String? title;

  @override
  Widget build(BuildContext context) {
    final t = sq(context);
    return Container(
      decoration: BoxDecoration(
        color: t.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(t.radiusXl)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.paddingOf(context).bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 10),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: t.border,
              borderRadius: BorderRadius.circular(99),
            ),
          ),
          if (title != null) ...[
            const SizedBox(height: 16),
            Text(
              title!,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: t.text,
              ),
            ),
          ],
          child,
        ],
      ),
    );
  }
}
