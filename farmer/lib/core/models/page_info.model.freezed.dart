// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'page_info.model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$PageInfoModel {

 int get currentPage; int get pageSize; int get itemCount; int get pageCount;
/// Create a copy of PageInfoModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PageInfoModelCopyWith<PageInfoModel> get copyWith => _$PageInfoModelCopyWithImpl<PageInfoModel>(this as PageInfoModel, _$identity);

  /// Serializes this PageInfoModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PageInfoModel&&(identical(other.currentPage, currentPage) || other.currentPage == currentPage)&&(identical(other.pageSize, pageSize) || other.pageSize == pageSize)&&(identical(other.itemCount, itemCount) || other.itemCount == itemCount)&&(identical(other.pageCount, pageCount) || other.pageCount == pageCount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,currentPage,pageSize,itemCount,pageCount);

@override
String toString() {
  return 'PageInfoModel(currentPage: $currentPage, pageSize: $pageSize, itemCount: $itemCount, pageCount: $pageCount)';
}


}

/// @nodoc
abstract mixin class $PageInfoModelCopyWith<$Res>  {
  factory $PageInfoModelCopyWith(PageInfoModel value, $Res Function(PageInfoModel) _then) = _$PageInfoModelCopyWithImpl;
@useResult
$Res call({
 int currentPage, int pageSize, int itemCount, int pageCount
});




}
/// @nodoc
class _$PageInfoModelCopyWithImpl<$Res>
    implements $PageInfoModelCopyWith<$Res> {
  _$PageInfoModelCopyWithImpl(this._self, this._then);

  final PageInfoModel _self;
  final $Res Function(PageInfoModel) _then;

/// Create a copy of PageInfoModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? currentPage = null,Object? pageSize = null,Object? itemCount = null,Object? pageCount = null,}) {
  return _then(_self.copyWith(
currentPage: null == currentPage ? _self.currentPage : currentPage // ignore: cast_nullable_to_non_nullable
as int,pageSize: null == pageSize ? _self.pageSize : pageSize // ignore: cast_nullable_to_non_nullable
as int,itemCount: null == itemCount ? _self.itemCount : itemCount // ignore: cast_nullable_to_non_nullable
as int,pageCount: null == pageCount ? _self.pageCount : pageCount // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [PageInfoModel].
extension PageInfoModelPatterns on PageInfoModel {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PageInfoModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PageInfoModel() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PageInfoModel value)  $default,){
final _that = this;
switch (_that) {
case _PageInfoModel():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PageInfoModel value)?  $default,){
final _that = this;
switch (_that) {
case _PageInfoModel() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int currentPage,  int pageSize,  int itemCount,  int pageCount)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PageInfoModel() when $default != null:
return $default(_that.currentPage,_that.pageSize,_that.itemCount,_that.pageCount);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int currentPage,  int pageSize,  int itemCount,  int pageCount)  $default,) {final _that = this;
switch (_that) {
case _PageInfoModel():
return $default(_that.currentPage,_that.pageSize,_that.itemCount,_that.pageCount);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int currentPage,  int pageSize,  int itemCount,  int pageCount)?  $default,) {final _that = this;
switch (_that) {
case _PageInfoModel() when $default != null:
return $default(_that.currentPage,_that.pageSize,_that.itemCount,_that.pageCount);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PageInfoModel implements PageInfoModel {
  const _PageInfoModel({required this.currentPage, required this.pageSize, required this.itemCount, required this.pageCount});
  factory _PageInfoModel.fromJson(Map<String, dynamic> json) => _$PageInfoModelFromJson(json);

@override final  int currentPage;
@override final  int pageSize;
@override final  int itemCount;
@override final  int pageCount;

/// Create a copy of PageInfoModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PageInfoModelCopyWith<_PageInfoModel> get copyWith => __$PageInfoModelCopyWithImpl<_PageInfoModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PageInfoModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PageInfoModel&&(identical(other.currentPage, currentPage) || other.currentPage == currentPage)&&(identical(other.pageSize, pageSize) || other.pageSize == pageSize)&&(identical(other.itemCount, itemCount) || other.itemCount == itemCount)&&(identical(other.pageCount, pageCount) || other.pageCount == pageCount));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,currentPage,pageSize,itemCount,pageCount);

@override
String toString() {
  return 'PageInfoModel(currentPage: $currentPage, pageSize: $pageSize, itemCount: $itemCount, pageCount: $pageCount)';
}


}

/// @nodoc
abstract mixin class _$PageInfoModelCopyWith<$Res> implements $PageInfoModelCopyWith<$Res> {
  factory _$PageInfoModelCopyWith(_PageInfoModel value, $Res Function(_PageInfoModel) _then) = __$PageInfoModelCopyWithImpl;
@override @useResult
$Res call({
 int currentPage, int pageSize, int itemCount, int pageCount
});




}
/// @nodoc
class __$PageInfoModelCopyWithImpl<$Res>
    implements _$PageInfoModelCopyWith<$Res> {
  __$PageInfoModelCopyWithImpl(this._self, this._then);

  final _PageInfoModel _self;
  final $Res Function(_PageInfoModel) _then;

/// Create a copy of PageInfoModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? currentPage = null,Object? pageSize = null,Object? itemCount = null,Object? pageCount = null,}) {
  return _then(_PageInfoModel(
currentPage: null == currentPage ? _self.currentPage : currentPage // ignore: cast_nullable_to_non_nullable
as int,pageSize: null == pageSize ? _self.pageSize : pageSize // ignore: cast_nullable_to_non_nullable
as int,itemCount: null == itemCount ? _self.itemCount : itemCount // ignore: cast_nullable_to_non_nullable
as int,pageCount: null == pageCount ? _self.pageCount : pageCount // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
