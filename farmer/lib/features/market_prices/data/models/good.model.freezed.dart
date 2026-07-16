// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'good.model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$GoodModel {

@JsonKey(name: '_id') String? get id; String get code; String get name; String? get localName; String get categoryCode; String get defaultUnit; String? get imageUrl; bool get active;
/// Create a copy of GoodModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$GoodModelCopyWith<GoodModel> get copyWith => _$GoodModelCopyWithImpl<GoodModel>(this as GoodModel, _$identity);

  /// Serializes this GoodModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is GoodModel&&(identical(other.id, id) || other.id == id)&&(identical(other.code, code) || other.code == code)&&(identical(other.name, name) || other.name == name)&&(identical(other.localName, localName) || other.localName == localName)&&(identical(other.categoryCode, categoryCode) || other.categoryCode == categoryCode)&&(identical(other.defaultUnit, defaultUnit) || other.defaultUnit == defaultUnit)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.active, active) || other.active == active));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,code,name,localName,categoryCode,defaultUnit,imageUrl,active);

@override
String toString() {
  return 'GoodModel(id: $id, code: $code, name: $name, localName: $localName, categoryCode: $categoryCode, defaultUnit: $defaultUnit, imageUrl: $imageUrl, active: $active)';
}


}

/// @nodoc
abstract mixin class $GoodModelCopyWith<$Res>  {
  factory $GoodModelCopyWith(GoodModel value, $Res Function(GoodModel) _then) = _$GoodModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: '_id') String? id, String code, String name, String? localName, String categoryCode, String defaultUnit, String? imageUrl, bool active
});




}
/// @nodoc
class _$GoodModelCopyWithImpl<$Res>
    implements $GoodModelCopyWith<$Res> {
  _$GoodModelCopyWithImpl(this._self, this._then);

  final GoodModel _self;
  final $Res Function(GoodModel) _then;

/// Create a copy of GoodModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = freezed,Object? code = null,Object? name = null,Object? localName = freezed,Object? categoryCode = null,Object? defaultUnit = null,Object? imageUrl = freezed,Object? active = null,}) {
  return _then(_self.copyWith(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,code: null == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,localName: freezed == localName ? _self.localName : localName // ignore: cast_nullable_to_non_nullable
as String?,categoryCode: null == categoryCode ? _self.categoryCode : categoryCode // ignore: cast_nullable_to_non_nullable
as String,defaultUnit: null == defaultUnit ? _self.defaultUnit : defaultUnit // ignore: cast_nullable_to_non_nullable
as String,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [GoodModel].
extension GoodModelPatterns on GoodModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _GoodModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _GoodModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _GoodModel value)  $default,){
final _that = this;
switch (_that) {
case _GoodModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _GoodModel value)?  $default,){
final _that = this;
switch (_that) {
case _GoodModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: '_id')  String? id,  String code,  String name,  String? localName,  String categoryCode,  String defaultUnit,  String? imageUrl,  bool active)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _GoodModel() when $default != null:
return $default(_that.id,_that.code,_that.name,_that.localName,_that.categoryCode,_that.defaultUnit,_that.imageUrl,_that.active);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: '_id')  String? id,  String code,  String name,  String? localName,  String categoryCode,  String defaultUnit,  String? imageUrl,  bool active)  $default,) {final _that = this;
switch (_that) {
case _GoodModel():
return $default(_that.id,_that.code,_that.name,_that.localName,_that.categoryCode,_that.defaultUnit,_that.imageUrl,_that.active);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: '_id')  String? id,  String code,  String name,  String? localName,  String categoryCode,  String defaultUnit,  String? imageUrl,  bool active)?  $default,) {final _that = this;
switch (_that) {
case _GoodModel() when $default != null:
return $default(_that.id,_that.code,_that.name,_that.localName,_that.categoryCode,_that.defaultUnit,_that.imageUrl,_that.active);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _GoodModel implements GoodModel {
  const _GoodModel({@JsonKey(name: '_id') this.id, required this.code, required this.name, this.localName, required this.categoryCode, required this.defaultUnit, this.imageUrl, this.active = true});
  factory _GoodModel.fromJson(Map<String, dynamic> json) => _$GoodModelFromJson(json);

@override@JsonKey(name: '_id') final  String? id;
@override final  String code;
@override final  String name;
@override final  String? localName;
@override final  String categoryCode;
@override final  String defaultUnit;
@override final  String? imageUrl;
@override@JsonKey() final  bool active;

/// Create a copy of GoodModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$GoodModelCopyWith<_GoodModel> get copyWith => __$GoodModelCopyWithImpl<_GoodModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$GoodModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _GoodModel&&(identical(other.id, id) || other.id == id)&&(identical(other.code, code) || other.code == code)&&(identical(other.name, name) || other.name == name)&&(identical(other.localName, localName) || other.localName == localName)&&(identical(other.categoryCode, categoryCode) || other.categoryCode == categoryCode)&&(identical(other.defaultUnit, defaultUnit) || other.defaultUnit == defaultUnit)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.active, active) || other.active == active));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,code,name,localName,categoryCode,defaultUnit,imageUrl,active);

@override
String toString() {
  return 'GoodModel(id: $id, code: $code, name: $name, localName: $localName, categoryCode: $categoryCode, defaultUnit: $defaultUnit, imageUrl: $imageUrl, active: $active)';
}


}

/// @nodoc
abstract mixin class _$GoodModelCopyWith<$Res> implements $GoodModelCopyWith<$Res> {
  factory _$GoodModelCopyWith(_GoodModel value, $Res Function(_GoodModel) _then) = __$GoodModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: '_id') String? id, String code, String name, String? localName, String categoryCode, String defaultUnit, String? imageUrl, bool active
});




}
/// @nodoc
class __$GoodModelCopyWithImpl<$Res>
    implements _$GoodModelCopyWith<$Res> {
  __$GoodModelCopyWithImpl(this._self, this._then);

  final _GoodModel _self;
  final $Res Function(_GoodModel) _then;

/// Create a copy of GoodModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = freezed,Object? code = null,Object? name = null,Object? localName = freezed,Object? categoryCode = null,Object? defaultUnit = null,Object? imageUrl = freezed,Object? active = null,}) {
  return _then(_GoodModel(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,code: null == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,localName: freezed == localName ? _self.localName : localName // ignore: cast_nullable_to_non_nullable
as String?,categoryCode: null == categoryCode ? _self.categoryCode : categoryCode // ignore: cast_nullable_to_non_nullable
as String,defaultUnit: null == defaultUnit ? _self.defaultUnit : defaultUnit // ignore: cast_nullable_to_non_nullable
as String,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
