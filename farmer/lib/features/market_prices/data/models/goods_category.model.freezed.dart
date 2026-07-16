// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'goods_category.model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$GoodsCategoryModel {

@JsonKey(name: '_id') String? get id; String get code; String get name; String? get localName; String? get icon; bool get active;
/// Create a copy of GoodsCategoryModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GoodsCategoryModelCopyWith<GoodsCategoryModel> get copyWith => _$GoodsCategoryModelCopyWithImpl<GoodsCategoryModel>(this as GoodsCategoryModel, _$identity);

  /// Serializes this GoodsCategoryModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is GoodsCategoryModel&&(identical(other.id, id) || other.id == id)&&(identical(other.code, code) || other.code == code)&&(identical(other.name, name) || other.name == name)&&(identical(other.localName, localName) || other.localName == localName)&&(identical(other.icon, icon) || other.icon == icon)&&(identical(other.active, active) || other.active == active));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,code,name,localName,icon,active);

@override
String toString() {
  return 'GoodsCategoryModel(id: $id, code: $code, name: $name, localName: $localName, icon: $icon, active: $active)';
}


}

/// @nodoc
abstract mixin class $GoodsCategoryModelCopyWith<$Res>  {
  factory $GoodsCategoryModelCopyWith(GoodsCategoryModel value, $Res Function(GoodsCategoryModel) _then) = _$GoodsCategoryModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id') String? id, String code, String name, String? localName, String? icon, bool active
});




}
/// @nodoc
class _$GoodsCategoryModelCopyWithImpl<$Res>
    implements $GoodsCategoryModelCopyWith<$Res> {
  _$GoodsCategoryModelCopyWithImpl(this._self, this._then);

  final GoodsCategoryModel _self;
  final $Res Function(GoodsCategoryModel) _then;

/// Create a copy of GoodsCategoryModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = freezed,Object? code = null,Object? name = null,Object? localName = freezed,Object? icon = freezed,Object? active = null,}) {
  return _then(_self.copyWith(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,code: null == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,localName: freezed == localName ? _self.localName : localName // ignore: cast_nullable_to_non_nullable
as String?,icon: freezed == icon ? _self.icon : icon // ignore: cast_nullable_to_non_nullable
as String?,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [GoodsCategoryModel].
extension GoodsCategoryModelPatterns on GoodsCategoryModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _GoodsCategoryModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _GoodsCategoryModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _GoodsCategoryModel value)  $default,){
final _that = this;
switch (_that) {
case _GoodsCategoryModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _GoodsCategoryModel value)?  $default,){
final _that = this;
switch (_that) {
case _GoodsCategoryModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id')  String? id,  String code,  String name,  String? localName,  String? icon,  bool active)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _GoodsCategoryModel() when $default != null:
return $default(_that.id,_that.code,_that.name,_that.localName,_that.icon,_that.active);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id')  String? id,  String code,  String name,  String? localName,  String? icon,  bool active)  $default,) {final _that = this;
switch (_that) {
case _GoodsCategoryModel():
return $default(_that.id,_that.code,_that.name,_that.localName,_that.icon,_that.active);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id')  String? id,  String code,  String name,  String? localName,  String? icon,  bool active)?  $default,) {final _that = this;
switch (_that) {
case _GoodsCategoryModel() when $default != null:
return $default(_that.id,_that.code,_that.name,_that.localName,_that.icon,_that.active);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _GoodsCategoryModel implements GoodsCategoryModel {
  const _GoodsCategoryModel({@JsonKey(name: '_id') this.id, required this.code, required this.name, this.localName, this.icon, this.active = true});
  factory _GoodsCategoryModel.fromJson(Map<String, dynamic> json) => _$GoodsCategoryModelFromJson(json);

@override@JsonKey(name: '_id') final  String? id;
@override final  String code;
@override final  String name;
@override final  String? localName;
@override final  String? icon;
@override@JsonKey() final  bool active;

/// Create a copy of GoodsCategoryModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GoodsCategoryModelCopyWith<_GoodsCategoryModel> get copyWith => __$GoodsCategoryModelCopyWithImpl<_GoodsCategoryModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GoodsCategoryModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _GoodsCategoryModel&&(identical(other.id, id) || other.id == id)&&(identical(other.code, code) || other.code == code)&&(identical(other.name, name) || other.name == name)&&(identical(other.localName, localName) || other.localName == localName)&&(identical(other.icon, icon) || other.icon == icon)&&(identical(other.active, active) || other.active == active));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,code,name,localName,icon,active);

@override
String toString() {
  return 'GoodsCategoryModel(id: $id, code: $code, name: $name, localName: $localName, icon: $icon, active: $active)';
}


}

/// @nodoc
abstract mixin class _$GoodsCategoryModelCopyWith<$Res> implements $GoodsCategoryModelCopyWith<$Res> {
  factory _$GoodsCategoryModelCopyWith(_GoodsCategoryModel value, $Res Function(_GoodsCategoryModel) _then) = __$GoodsCategoryModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id') String? id, String code, String name, String? localName, String? icon, bool active
});




}
/// @nodoc
class __$GoodsCategoryModelCopyWithImpl<$Res>
    implements _$GoodsCategoryModelCopyWith<$Res> {
  __$GoodsCategoryModelCopyWithImpl(this._self, this._then);

  final _GoodsCategoryModel _self;
  final $Res Function(_GoodsCategoryModel) _then;

/// Create a copy of GoodsCategoryModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = freezed,Object? code = null,Object? name = null,Object? localName = freezed,Object? icon = freezed,Object? active = null,}) {
  return _then(_GoodsCategoryModel(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,code: null == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,localName: freezed == localName ? _self.localName : localName // ignore: cast_nullable_to_non_nullable
as String?,icon: freezed == icon ? _self.icon : icon // ignore: cast_nullable_to_non_nullable
as String?,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
